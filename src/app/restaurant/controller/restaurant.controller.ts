import { NextFunction, Request, Response } from "express";
import { RestaurantService } from "../service/restaurant.service";
import { validateBody } from "../../../lib/validation/validate";
import { CreateRestaurantDTO, UpdateRestaurantDTO, UpdateRestaurantStatusDTO } from "../DTO/restaurantDTO";
import { SystemRole } from "../../user/enums";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { sendPaginated , sendSuccess } from "../../../lib/http/response";
import { parsePaginationQuery, parseFilters } from "../../../lib/http/pagination/parse_query";

@injectable()
export class RestaurantController{
    constructor( @inject(TOKENS.RestaurantService) private readonly restaurantService:RestaurantService){

    }

    getAll = async(req:Request , res:Response , next:NextFunction)=>{
        try {
             const params = parsePaginationQuery(req.query);
            const filters = parseFilters(req.query,['id' , 'status' , 'name'])
            const result = await this.restaurantService.findAll(params , filters);
            sendPaginated(res,result.data , result.meta);
            
        } catch (err) {
            next(err);
        }
    }

     getById = async(req:Request , res:Response , next:NextFunction)=>{
        try {
            const restaurantId = Number(req.params.id)
            const result = await this.restaurantService.findById(restaurantId);
            sendSuccess(res,{data: result})
            
        } catch (err) {
            next(err);
        }
    }

    create= async(req:Request , res:Response , next:NextFunction)=>{
        try {
            const data = await validateBody(CreateRestaurantDTO, req.body);
            const restaurant =await this.restaurantService.createWithOwner(data,req.user?.role! as SystemRole);
            sendSuccess(res,restaurant, 201);
            
        } catch (err) {
            next(err)
        }
    }

    update = async(req:Request , res:Response , next:NextFunction)=>{
        try {
            const data = await validateBody(UpdateRestaurantDTO , req.body);
            const restaurantId = Number(req.params.id);
            const result =await this.restaurantService.update(data,restaurantId,
                req.user?.role! as SystemRole, req.user?.userId!
            );
            sendSuccess(res, {message: "Restaurant updated", restaurant: result});
            
        } catch (err) {
            next(err)
        }
    } 

    updateStatus = async(req:Request , res:Response , next:NextFunction)=>{
        try {
            const data = await validateBody(UpdateRestaurantStatusDTO , req.body);
            const restaurantId = Number(req.params.id);
            const result =await this.restaurantService.updateStatus(data,restaurantId,
                req.user?.role! as SystemRole);
            sendSuccess(res, {message: "Status updated", restaurant: {id: result.id, status: result.status}});
            
        } catch (err) {
            next(err)
        }
    } 
}