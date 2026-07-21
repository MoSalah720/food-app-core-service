import { findUserByEmail, updateUserPassword } from "../../user/repository/users.repo";
import { ForgetPasswordDTO, LoginDTO, RegisterDTO, ResetPasswordDTO } from "../dto/auth.dto";
import { CannotSignUpAsSystemAdmin, IncorrectCredentials, InvalidOTPError, RestaurantDataIsRequiredError } from "../error";
import { createAccessToken, createRefreshToken, generateOTP, hashOTP, hashPassword, varifyRefreshToken } from "../utils";
import { SystemRole } from "../../user/enums";
import { compare } from "bcrypt";
import { createPasswordResets, findLatestPasswordResetByUserId, updatePasswordResetConsumedAt } from "../repository/password_reset.repo";
import { RestaurantService } from "../../restaurant/service/restaurant.service";
import { db } from "../../../lib/knex/knex";
import { activateMemberByUserId, findRestaurantMemberWithRole } from "../../rbac/repository/restaurant_member.repo";
import { findBranchIdsByMemberId } from "../../rbac/repository/member_branch.repo";
import { MemberNotFound } from "../../rbac/errors";
import { MemberService } from "../../rbac/service/member.service";
import { UserService } from "../../user/service/user.service";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";


@injectable()
export class AuthService{
    constructor(@inject(TOKENS.RestaurantService) private readonly restaurantService:RestaurantService,
        @inject(TOKENS.MemberService) private readonly memberService:MemberService,
        @inject(TOKENS.UserService) private readonly userService :UserService
    ){}
    register = async(data :RegisterDTO)=>{

        if (data.role===SystemRole.SYSTEM_ADMIN) {
            throw CannotSignUpAsSystemAdmin
        }


       // 4. create user

       const now = new Date();
       const trx = await db.transaction();
       let user;
       let restaurant;
      let RestaurantMemberInfo :{restaurantId?:number,restaurantRole?:string,branchIds?:number[]} ={};
        try {
            user = await this.userService.create({
                email:data.email,
                phone:data.phone,
                password:data.password,
                name :data.name,
                systemRole:data.role,
                
            }, trx)

            // chexk if the type of user is restaurant and then call the restaurant service to create the restaurant

            if (data.role === SystemRole.RESTAURANT_USER) {
                if (data.restaurant == undefined) {
                    throw RestaurantDataIsRequiredError
                }
                restaurant = await this.restaurantService.create( user.id, data.restaurant , trx);
               

                await this.memberService.createOwnerMember(restaurant.id, user.id, trx);
           
                RestaurantMemberInfo = {
                    restaurantId: restaurant.id,
                    restaurantRole : 'owner',
                    branchIds:[]
                }
            
            await trx.commit();
            }
        
       } catch (error) {
        
        await trx.rollback();
        throw error;
       }
      

       // 5. create access token , refresh token
       const payload ={userId: user.id , role: data.role , email: user.email, ...RestaurantMemberInfo}
       const accessToken = createAccessToken(payload);
       const refreshToken = createRefreshToken(payload);

       // 6. return tokens and user data

        return {
            message:"success",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                systemRole: user.systemRole,
                createdAt: user.createdAt
            },
            restaurant

        }

    }

    login =async(data:LoginDTO)=>{
        //1 . find the password by email 
        
        const user = await findUserByEmail(data.email);
        if (!user) {
            throw IncorrectCredentials;
        }
        //2. compare the password
        const match = await compare(data.password,user.passwordHash);
        if (!match) {
            throw IncorrectCredentials;
        }
        let RestaurantMemberInfo = null;

        if (user.systemRole === SystemRole.RESTAURANT_USER) {
            const memberData = await findRestaurantMemberWithRole(user.id);
            console.log(memberData);
            if (!memberData) {
                throw MemberNotFound;
            }
            const branchIds = await findBranchIdsByMemberId(memberData.member.id)
            if (memberData) {
                RestaurantMemberInfo = {
                    restaurantId: memberData.member.restaurantId,
                    restaurantRole : memberData.roleName,
                    branchIds
                }
            }
        }

        //3. generate tokens
        const payload ={userId: user.id , role: user.systemRole , email: user.email, ...RestaurantMemberInfo}

       const accessToken = createAccessToken(payload);
       const refreshToken = createRefreshToken(payload);
       //4. return data

       return {
        message:"login successfully",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                systemRole: user.systemRole,
                createdAt: user.createdAt,
            }
       }

    }

    forgetPassword =async(data:ForgetPasswordDTO)=>{
        const user = await findUserByEmail(data.email);
        if (!user) {
            return;
        }
        const otp =generateOTP();
        const hashedOTP=hashOTP(otp);
        await createPasswordResets({
            userId: user.id,
            otpHash:hashedOTP,
            expiresAt: new Date(Date.now() +(10*60*1000)),
            createdAt:new Date()

        });

        console.log(`mocked email sent ${otp}`)
    }

    resetPassword = async(data:ResetPasswordDTO)=>{
        const user = await findUserByEmail(data.email);
        if (!user) {
            throw InvalidOTPError;
        }
        
        const Reset= await findLatestPasswordResetByUserId(user.id);
        if (!Reset) {
            throw InvalidOTPError;
        }

        const inputOTPHash = hashOTP(data.otp);

        if (inputOTPHash != Reset.otpHash || Reset.isExpired()) {
            throw InvalidOTPError;
        }
        const hashedPassword = await hashPassword(data.newPassword);
        await updateUserPassword(user.id , hashedPassword);

        await updatePasswordResetConsumedAt(Reset.id);

        return user;
    }
    refresh= async(refreshToken:string)=>{
    if (!refreshToken) {
            throw IncorrectCredentials;
        }
        const payload = varifyRefreshToken(refreshToken);
        const accessToken = createAccessToken({userId: payload.userId, role: payload.role, email: payload.email});
        return {accessToken};
    }
    acceptInvite = async(data: ResetPasswordDTO)=>{
        const user = await this.resetPassword(data);
        
        await activateMemberByUserId(user.id);
    }
}