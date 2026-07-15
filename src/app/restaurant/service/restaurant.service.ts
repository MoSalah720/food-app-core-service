import { Knex } from "knex";
import { RegisterRestaurantDTO } from "../../auth/dto/auth.dto";
import { Restaurant } from "../entity/restaurant.entity";
import { RestaurantStatus } from "../enums";
import { createRestaurant, findAllRestaurant, findRestaurantById, updataRestaurantStatus, updateRestaurant } from "../repository/restaurant.repo";
import { RestaurantNotFound, UserMustBeASYSTEMADMIN } from "../error";
import { CreateRestaurantDTO, UpdateRestaurantDTO, UpdateRestaurantStatusDTO } from "../DTO/restaurantDTO";
import { createUser, findUserExistByEmailOrPhone } from "../../user/repository/users.repo";
import { SystemRole } from "../../user/enums";
import { UserAlreadyExistError } from "../../auth/error";
import { hashPassword } from "../../auth/utils";
import { db } from "../../../common/knex/knex";
import { unAuthorizedError } from "../../../common/auth/error";
import { userService, UserService } from "../../user/service/user.service";
import { memberService } from "../../rbac/service/member.service";

function toResponseOwner(user:any){
    return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        systemRole: user.systemRole
    };
}

function toResponseRestaurant(restaurant:any){
    return{
        id: restaurant.id,
        ownerId: restaurant.ownerId,
        name: restaurant.name,
        logoURL: restaurant.logoURL,
        primaryCountry: restaurant.primaryCountry,
        status: restaurant.status,
        createdAt: restaurant.createdAt,
    }
}
export class RestaurantService{

    constructor(private readonly userService:UserService){}
    create = async(userId:number , data:RegisterRestaurantDTO, trx:Knex)=>{
        const now = new Date();

        const restaurant = new Restaurant({
            ownerId: userId,
            name: data.name,
            logoURL: data.logoURL,
            status: RestaurantStatus.PENDING,
            primaryCountry: data.primaryCountry,
            createdAt: now,
            updatedAt: now,
            statusUpdatedAt: now
        });

        const result = await createRestaurant(restaurant , trx);

        return result;
    }

    findAll = async()=>{
        const result = await findAllRestaurant();
        return result;
    }

    findById = async(id : number)=>{
        const restaurant = await findRestaurantById(id);
        if (!restaurant) {
            throw RestaurantNotFound;
        }
        return restaurant;
    }

    createWithOwner = async(data:CreateRestaurantDTO,userRole:SystemRole)=>{
        if (userRole !== SystemRole.SYSTEM_ADMIN) {
            throw unAuthorizedError;
        }
        const trx = await db.transaction();
        let restaurant;
        try {
            const user = await this.userService.create({
                email:data.owner.email,
                phone:data.owner.phone,
                password:data.owner.password,
                name :data.owner.name,
                systemRole:SystemRole.RESTAURANT_USER
            },trx)

         restaurant =await this.create(user.id,data ,trx);
            
            await memberService.createOwnerMember(restaurant.id, user.id, trx)
            
            await trx.commit();

            return{
                    message: "Restaurant created successfully",
                    owner: toResponseOwner(user),
                    restaurant: toResponseRestaurant(restaurant)
                }
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
    update =async(data:UpdateRestaurantDTO ,id:number,userRole:SystemRole,userId:number)=>{
       

        const restaurant = await findRestaurantById(id);
        if (!restaurant) {
            throw RestaurantNotFound;
        }
        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw unAuthorizedError;
        }

        const updated = await updateRestaurant(restaurant.id,data);
        return {
            message: "restaurant updated successfully",
            restaurant: toResponseRestaurant(updated)
        }
    }

    updateStatus =async(data:UpdateRestaurantStatusDTO ,id:number,userRole:SystemRole)=>{
       
        if (userRole !== SystemRole.SYSTEM_ADMIN ) {
            throw UserMustBeASYSTEMADMIN;
        }

        const restaurant = await findRestaurantById(id);
        if (!restaurant) {
            throw RestaurantNotFound;
        }

        const updated = await updataRestaurantStatus(restaurant.id,data.status);
        return {

            message :"status updated",
            restaurant:{
                 id: updated.id,
            status: updated.status

            }
           
        };
    }

}

export const restaurantService = new RestaurantService(userService);