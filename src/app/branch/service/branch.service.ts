import { injectable } from "tsyringe";
import { unAuthorizedError } from "../../../lib/auth/error";
import { RestaurantNotFound } from "../../restaurant/error";
import { findRestaurantById } from "../../restaurant/repository/restaurant.repo";
import { SystemRole } from "../../user/enums";
import { CreateBranchDTO, UpdateBranchDTO, UpdateBranchStatusDTO } from "../DTO/branch..DTO";
import { BranchNotFound } from "../error";
import { createBranch, findBranchById, findBranchesByRestaurant, findNearbyBranches, updateBranch, updateBranchStatus } from "../repository/branch.repo"

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
    
    update = async(data:UpdateBranchDTO , userId:number ,userRole:SystemRole , branchId:number)=>{
        const branch = await findBranchById(branchId);
        if (!branch) {
            throw BranchNotFound;
        }
        const restaurant = await findRestaurantById(branch.restaurantId);
       
        if (userRole !== SystemRole.SYSTEM_ADMIN && restaurant?.ownerId !== userId) {
            throw unAuthorizedError;
        }
        
        const updated =await updateBranch(branch.id ,data);
       
        return{
            branch: toResponseBranch(updated)
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
     
        return await updateBranchStatus(branch.id ,data);
    
    }
}