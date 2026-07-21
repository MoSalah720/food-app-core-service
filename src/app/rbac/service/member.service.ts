import { db } from "../../../lib/knex/knex";
import { UserAlreadyExistError } from "../../auth/error";
import { SystemRole } from "../../user/enums";
import { findUserByEmail } from "../../user/repository/users.repo";
import { CreateMemberDTO, UpdateMemberBranchesDTO, UpdateMemberDTO } from "../DTO/member.dto";
import { CannotCreateOwnerUserError, CannotDeleteOwnerError, MemberNotFoundError, RoleNotFoundError } from "../errors";
import { createRestaurantMember, deleteMember, findMembersByRestaurantId, findMemberWithRoleName, updateMember } from "../repository/restaurant_member.repo";
import { findRoleByName } from "../repository/role.repo";
import { MemberStatus } from "../enums";
import { MemberBranch } from "../entity/member_branch";
import { countBranchesByIdsAndRestaurant, setMemberBranches } from "../repository/member_branch.repo";
import { createPasswordResets } from "../../auth/repository/password_reset.repo";
import { generateOTP, hashOTP } from "../../auth/utils";
import { toMS } from "../../../pkg/utils/time";
import { Knex } from "knex";
import { RestaurantMember } from "../entity/restaurant_member.entity";
import { AppError } from "../../../lib/error/AppError";
import { getPermissionsDetailsByRoleName } from "../repository/permission.repo";
import { inject, injectable } from "tsyringe";
import { UserService } from "../../user/service/user.service";
import { TOKENS } from "../../../lib/di/tokens";

@injectable()
export class MemberService{

    constructor(@inject(TOKENS.UserService) private readonly userService: UserService) {}
    async createOwnerMember (restaurantId:number , userId: number , trx?: Knex.Transaction):Promise<RestaurantMember>{
        const ownerRoleId = await findRoleByName('owner',trx);
        if(!ownerRoleId) throw RoleNotFoundError;
        const now = new Date();
        return await createRestaurantMember({
            userId,
            restaurantId,
            roleId:ownerRoleId,
            status: MemberStatus.ACTIVE,
            createdAt: now,
            updatedAt: now
        },trx);

    }
    createMember= async(restaurantId:number, data: CreateMemberDTO)=>{
        if (data.role =='owner') {
            throw CannotCreateOwnerUserError;
        }

        const existingUser =await findUserByEmail(data.email);
        if (existingUser) {
            throw UserAlreadyExistError;
        }
        const roleId= await findRoleByName(data.role);
        if (!roleId) {
            throw RoleNotFoundError;
        }
        const branchIds =data.branchIds||[];
        await this.validateBranchOwnership(branchIds,restaurantId);
        const trx = await db.transaction();
        try {
            const now = new Date();

            const user = await this.userService.create({
                email: data.email,
                name: data.name,
                phone: data.phoneNumber,
                password: "",
                systemRole: SystemRole.RESTAURANT_USER,
               
            },trx)

            const member = await createRestaurantMember({
                restaurantId,
                userId: user.id,
                roleId,
                status: MemberStatus.INACTIVE,
                createdAt: now,
                updatedAt: now
            },trx);

            const rows = data.branchIds.map(branchId=> new MemberBranch({
                branchId: branchId,
                memberId: member.id,
                createdAt: now
            }));

            await setMemberBranches(member.id, rows, trx);

            const otp =generateOTP();
            const hashedOTP=hashOTP(otp);
            await createPasswordResets({
                userId: user.id,
                otpHash:hashedOTP,
                expiresAt: new Date(Date.now() + toMS(1,'h')),
                createdAt:new Date()
            },trx);

            console.log(`mocked email sent ${otp}`)

            await trx.commit();
             return {
            message: "Invitation sent successfully",
            member : {
                id: member.id,
                userId: member.userId,
                email: data.email,
                name: data.name,
                phone: data.phoneNumber,
                status: MemberStatus.INACTIVE,
                branchIds
            }
            }
            
        } catch (error) {
            await trx.rollback();
            throw error;
        }
       
    }

    async listMembers(restaurantId:number){
        const members = await findMembersByRestaurantId(restaurantId);
        return {
            data:members
        };
    }
    async updateMember(restaurantId:number , memberId:number, data:UpdateMemberDTO){
        const result = await findMemberWithRoleName(memberId);
        if (!result || Number(result.member.restaurantId) !== restaurantId) {
            throw MemberNotFoundError;
        }

       const updateData : {roleId?:number , status?:string} = {};
       if (data.role) {
            const roleId = await findRoleByName(data.role);
            if(!roleId) throw RoleNotFoundError;
            updateData.roleId = roleId;
       }
       if (data.status) {
            updateData.status = data.status;
       }
       await updateMember(memberId,updateData);
       return {message : "Member updated successfully"};
    }
    async deleteMember(restaurantId:number , memberId:number){
        const result = await findMemberWithRoleName(memberId);
        if (!result || Number(result.member.restaurantId) !== restaurantId) {
            throw MemberNotFoundError;
        }
        if (result.roleName === 'owner') {
            throw CannotDeleteOwnerError;
        }
        await deleteMember(memberId);
        return {message: "Member deleted successfully"};   
    }
    async updateMemberBranches(restaurantId:number , memberId:number, data:UpdateMemberBranchesDTO){
         const result = await findMemberWithRoleName(memberId);
        if (!result || Number(result.member.restaurantId) !== restaurantId) {
            throw MemberNotFoundError;
        }
        if (result.roleName === 'owner') {
            throw new AppError('Cannot assign branches to owner , owners have access to all branches', 400);
        }
       await this.validateBranchOwnership(data.branchIds,restaurantId);
        const rows = data.branchIds.map(branchId=>new MemberBranch({
            branchId:branchId,
            memberId: result.member.id,
            createdAt : new Date()
        }));
        await setMemberBranches(result.member.id, rows);
        return{message:"Member branches updated successfully"};
    }
    async  validateBranchOwnership(branchIds:number[], restaurantId:number){
        if(branchIds.length === 0 ) return;
         const count = await countBranchesByIdsAndRestaurant(branchIds,restaurantId);
        if (count !== branchIds.length) {
            throw new AppError("some branches don't belong to this restaurant",400)
        }
    }
    async getRolePermissions(roleName:string){
        const permissions = await getPermissionsDetailsByRoleName(roleName);
        return{
            role : roleName,
            permissions
        }
    }

}