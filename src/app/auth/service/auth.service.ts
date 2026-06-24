import { createUser, findUserByEmail, findUserExistByEmailOrPhone, updateUserPassword } from "../../user/repository/users.repo";
import { ForgetPasswordDTO, LoginDTO, RegisterDTO, ResetPasswordDTO } from "../dto/auth.dto";
import { CannotSignUpAsSystemAdmin, IncorrectCradentials, InvalidOTPError, UserAlreadyExistError } from "../error";
import { createAccessToken, createRefreshToken, generateOTP, hashOTP, hashPassword, varifyRefreshToken } from "../utils";
import { SystemRole } from "../../user/enums";
import { compare } from "bcrypt";
import { createPasswordResets, findLatestPasswordResetByUserId, updatePasswordResetConsumedAt } from "../repository/password_reset.repo";

export class AuthService{
    register = async(data :RegisterDTO)=>{


        if (data.role===SystemRole.SYSTEM_ADMIN) {
            throw CannotSignUpAsSystemAdmin
        }

      // 1. check if user exists by email

      const existing = await findUserExistByEmailOrPhone(data.email, data.phone);

      // 2. if exists we throw an error

      if (existing) {
        throw UserAlreadyExistError;
      }

       // 3. hashPassword
       const hashedPassword = await hashPassword(data.password)

       // 4. create user

       const now = new Date();
       const user = await createUser({
        email:data.email,
        phone:data.phone,
        passwordHash:hashedPassword,
        name :data.name,
        systemRole:data.role,
        createdAt:now,
        updatedAt:now
    })



       // 5. create access token , refresh token
       const payload ={userId: user.id , role: data.role , email: user.email}
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
            }
        }

    }

    login =async(data:LoginDTO)=>{
        //1 . find the password by email 
        
        const user = await findUserByEmail(data.email);
        if (!user) {
            throw IncorrectCradentials;
        }
        //2. compare the password
        const match = await compare(data.password,user.passwordHash);
        if (!match) {
            throw IncorrectCradentials;
        }

        //3. generate tokens
        const payload ={userId: user.id , role: user.systemRole , email: user.email}

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
    }
    refreshToken= async(token:string):Promise<string>=>{
    const { iat, exp, ...payload } = varifyRefreshToken(token) as any;
        return createAccessToken(payload);
    }
}

export const authService = new AuthService();