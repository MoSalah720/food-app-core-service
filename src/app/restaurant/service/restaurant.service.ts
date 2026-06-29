import { Knex } from "knex";
import { RegisterRestaurantDTO } from "../../auth/dto/auth.dto";
import { Restaurant } from "../entity/restaurant.entity";
import { RestaurantStatus } from "../enums";
import { createRestaurant, findAllRestaurant, findRestaurantById, updataRestaurantStatus, updateRestaurant } from "../repository/restaurant.repo";
import { RestaurantNotFound, UserMustBeAOwnerOrAdmin, UserMustBeASYSTEMADMIN } from "../error";
import { CreateRestaurantDTO, UpdateRestaurantDTO, UpdateRestaurantStatusDTO } from "../DTO/restaurantDTO";
import { createUser, findUserById, findUserExistByEmailOrPhone } from "../../user/repository/users.repo";
import { UserNotFound } from "../../user/error";
import { SystemRole } from "../../user/enums";
import { UserAlreadyExistError } from "../../auth/error";
import { hashPassword } from "../../auth/utils";
import { db } from "../../../common/knex/knex";

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

    createWithOwner = async(data:CreateRestaurantDTO,userId:number)=>{
        const userAdmin =await findUserById(userId);

        if (!userAdmin) {
            throw UserNotFound;
        }

        if (userAdmin.systemRole!== SystemRole.SYSTEM_ADMIN) {
            throw UserMustBeASYSTEMADMIN;
        }
         const existing = await findUserExistByEmailOrPhone(data.owner.email, data.owner.phone);
        if (existing) {
                throw UserAlreadyExistError;
        }
        const hashedPassword = await hashPassword(data.owner.password);

        const now = new Date();
        const trx = await db.transaction();
        let owner;
        let restaurant;
        try {
            owner = await createUser({
                email:data.owner.email,
                phone:data.owner.phone,
                passwordHash:hashedPassword,
                name :data.owner.name,
                systemRole:SystemRole.RESTAURANT_USER,
                createdAt:now,
                updatedAt:now
            },trx)

         restaurant =await this.create(owner.id,data ,trx);
            
            
            await trx.commit();
        } catch (error) {
            await trx.rollback();
            throw error;
        }

       
     return{
        message: "Restaurant created successfully",
        owner: toResponseOwner(owner),
        restaurant: toResponseRestaurant(restaurant)
     }
    }
    update =async(data:UpdateRestaurantDTO ,id:number,restaurantId:number)=>{
        const user = await findUserById(id);
        if (!user) {
            throw UserNotFound;
        }

        console.log(user.id);
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) {
            throw RestaurantNotFound;
        }

       console.log(restaurant);
        const isAdmin = user.systemRole === SystemRole.SYSTEM_ADMIN;
        const isOwner = restaurant.ownerId === user.id;

        if (!isAdmin && !isOwner) {
            throw UserMustBeAOwnerOrAdmin;
        }

        const updated = await updateRestaurant(restaurant.id,data);
        return {
            message: "restaurant updated successfully",
            restaurant: toResponseRestaurant(updated)
        }
    }

    updateStatus =async(data:UpdateRestaurantStatusDTO ,id:number,restaurantId:number)=>{
        const user = await findUserById(id);
        if (!user) {
            throw UserNotFound;
        }
        if (user?.systemRole !== SystemRole.SYSTEM_ADMIN ) {
            throw UserMustBeASYSTEMADMIN;
        }

        const restaurant = await findRestaurantById(restaurantId);
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

export const restaurantService = new RestaurantService();