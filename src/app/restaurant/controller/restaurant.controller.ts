import { NextFunction , Request ,Response } from "express";
import { restaurantService, RestaurantService } from "../service/restaurant.service";
import { validateBody } from "../../../common/validation/validate";
import { CreateRestaurantDTO, UpdateRestaurantDTO, UpdateRestaurantStatusDTO } from "../DTO/restaurantDTO";
import { SystemRole } from "../../user/enums";

export class RestaurantController{
    constructor(private readonly restaurantService:RestaurantService){

    }

    getAll = async(req:Request , res:Response , next:NextFunction)=>{
        try {
            const result = await this.restaurantService.findAll();
            res.status(200).json({data: result})
            
        } catch (err) {
            next(err);
        }
    }

     getById = async(req:Request , res:Response , next:NextFunction)=>{
        try {
            const restaurantId = Number(req.params.id)
            const result = await this.restaurantService.findById(restaurantId);
            res.status(200).json({data: result})
            
        } catch (err) {
            next(err);
        }
    }

    create= async(req:Request , res:Response , next:NextFunction)=>{
        try {
            const data = await validateBody(CreateRestaurantDTO, req.body);
            const restaurant =await this.restaurantService.createWithOwner(data,req.user?.role! as SystemRole);
            res.status(201).json(restaurant);
            
        } catch (err) {
            next(err)
        }
    }

    update = async(req:Request , res:Response , next:NextFunction)=>{
        try {
            const data = await validateBody(UpdateRestaurantDTO , req.body);
            const restaurantId = Number(req.params.id);
            const updated =await this.restaurantService.update(data,restaurantId,
                req.user?.role! as SystemRole, req.user?.userId!
            );
                res.status(200).json(updated); 
            
        } catch (err) {
            next(err)
        }
    } 

    updateStatus = async(req:Request , res:Response , next:NextFunction)=>{
        try {
            const data = await validateBody(UpdateRestaurantStatusDTO , req.body);
            const restaurantId = Number(req.params.id);
            const updated =await this.restaurantService.updateStatus(data,restaurantId,
                req.user?.role! as SystemRole);
                res.status(200).json(updated); 
            
        } catch (err) {
            next(err)
        }
    } 
}
export const restaurantController = new RestaurantController(restaurantService);