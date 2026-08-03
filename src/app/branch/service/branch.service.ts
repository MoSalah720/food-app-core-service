import { injectable } from "tsyringe";
import { unAuthorizedError } from "../../../lib/auth/error";
import { RestaurantNotFound } from "../../restaurant/error";
import { findRestaurantById } from "../../restaurant/repository/restaurant.repo";
import { SystemRole } from "../../user/enums";
import { CreateBranchDTO, UpdateBranchDTO, UpdateBranchStatusDTO } from "../DTO/branch..DTO";
import { BranchNotFound } from "../error";
import { createBranch, findBranchById, findBranchesByRestaurant, findNearbyBranches, updateBranch, updateBranchStatus } from "../repository/branch.repo"
import { db } from "../../../lib/knex/knex";
import { insertOutBoxEvent } from "../../../lib/events/outbox.repo";
import { EVENT_TYPES } from "../../../lib/events/event_types";
import { BranchWithRestaurant } from "../types";

function toResponseBranch(branch: any) {
    return {
        restaurantId: branch.restaurantId,
        countryCode: branch.countryCode,
        addressText: branch.addressText,
        label: branch.label,
        lat: branch.lat,
        lng: branch.lng,
        isActive: branch.isActive,
        opensAt: branch.opensAt,
        closesAt: branch.closesAt,
        acceptOrders: branch.acceptOrders,
        deliveryRadius: branch.deliveryRadius,
        currency: branch.currency,
        commission: branch.commission,
        createdAt: branch.createdAt,
        updatedAt: branch.updatedAt
    };
}
@injectable()
export class BranchService{
    findNearby = async(lat:number , lng:number)=>{
        const row = await findNearbyBranches(lat ,lng);
        return row;
    }

    create = async(restaurantId : number , userId:number , userRole: SystemRole ,data: CreateBranchDTO)=>{
        const restaurant = await findRestaurantById(restaurantId);

        console.log(restaurant);
         console.log(userId);
        if (userRole !== SystemRole.SYSTEM_ADMIN && (restaurant?.ownerId !== userId)) {
            throw unAuthorizedError;
        }

       
        const now = new Date();

        const branch = await createBranch({
            restaurantId: restaurantId,
            countryCode: data.countryCode,
            label: data.label,
            addressText: data.addressText,
            lat: data.lat,
            lng: data.lng,
            isActive: false,
            opensAt: data.opensAt,
            closesAt: data.closesAt,
            currency: data.currency,
            deliveryRadius: data.deliveryRadius,
            createdAt: now,
            updatedAt: now,
            commission:0,
            acceptOrders: true
        })

        return toResponseBranch(branch);
    }

    findByRestaurant= async(restaurantId:number)=>
    {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) {
            throw RestaurantNotFound;
        }

        const branches = await findBranchesByRestaurant(restaurant.id);

        return {
            data: branches.map(toResponseBranch)
        }
    }
    findByIdWithRestaurant = async (branchId: number): Promise<BranchWithRestaurant | null> => {
        const branch = await findBranchById(branchId);
        if (!branch) return null;
        const restaurant = await findRestaurantById(branch.restaurantId);
        return {branch, restaurantStatus: restaurant?.status ?? "unknown"};
    }
    update = async(data:UpdateBranchDTO , userId:number ,userRole:SystemRole , branchId:number)=>{
        const branch = await findBranchById(branchId);
        if (!branch) {
            throw BranchNotFound;
        }
        const restaurant = await findRestaurantById(branch.restaurantId);
       
        if (userRole !== SystemRole.SYSTEM_ADMIN && restaurant?.ownerId !== userId) {
            throw unAuthorizedError;
        }
        const trx = await db.transaction()
        try {
            const updated =await updateBranch(branch.id ,data , trx);
            await insertOutBoxEvent(trx,{
                aggregateType: "restaurant_branches",
                aggregateId: branchId,
                eventType: EVENT_TYPES.BRANCH_UPDATED,
                payload: {branchId}
            });
            await trx.commit();
            return updated;
        } catch (err) {
            await trx.rollback();
            throw err;
        }
       
    }

    updateStatus = async(data:UpdateBranchStatusDTO  ,userRole:SystemRole , branchId:number)=>{
         if (userRole !== SystemRole.SYSTEM_ADMIN ) {
            throw unAuthorizedError;
        }
        
        const branch = await findBranchById(branchId);
        if (!branch) {
            throw BranchNotFound;
        }
        const trx = await db.transaction();
        try {
            const updated= await updateBranchStatus(branch.id ,data, trx);
            const eventType = data.isActive === false?
            EVENT_TYPES.BRANCH_DEACTIVATED:
            EVENT_TYPES.BRANCH_UPDATED;
            await insertOutBoxEvent(trx,{
                aggregateType: "restaurant_branches",
                aggregateId: branchId,
                eventType,
                payload: {branchId}
            });
            await trx.commit();
            return updated
        } catch (err) {
            await trx.rollback();
            throw err;
        }
    
    }
}