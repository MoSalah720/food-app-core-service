import { Knex } from "knex";
import { RegisterRestaurantDTO } from "../../auth/dto/auth.dto";
import { Restaurant } from "../entity/restaurant.entity";
import { RestaurantStatus } from "../enums";
import { createRestaurant, findAllRestaurant, findRestaurantById, updataRestaurantStatus, updateRestaurant } from "../repository/restaurant.repo";
import { RestaurantNotFound, UserMustBeASYSTEMADMIN } from "../error";
import { CreateRestaurantDTO, UpdateRestaurantDTO, UpdateRestaurantStatusDTO } from "../DTO/restaurantDTO";
import { SystemRole } from "../../user/enums";
import { db } from "../../../lib/knex/knex";
import { unAuthorizedError } from "../../../lib/auth/error";
import { UserService } from "../../user/service/user.service";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";

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

@injectable()
export class RestaurantService{

    constructor(@inject(TOKENS.UserService) private readonly userService:UserService){}
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
        // resolve from container to avoid circular dependency

         const {container: c} = require("../../../lib/di/container");
         const {TOKENS: T} = require("../../../lib/di/tokens");
         const memberSvc = c.resolve(T.MemberService);
         await memberSvc.createOwnerMember(restaurant.id, user.id, trx);            
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

        return await updateRestaurant(restaurant.id,data);
       
    }

    updateStatus =async(data:UpdateRestaurantStatusDTO ,id:number,userRole:SystemRole)=>{
       
        if (userRole !== SystemRole.SYSTEM_ADMIN ) {
            throw UserMustBeASYSTEMADMIN;
        }

        const restaurant = await findRestaurantById(id);
        if (!restaurant) {
            throw RestaurantNotFound;
        }

        return await updataRestaurantStatus(restaurant.id,data.status);
        
    }

}