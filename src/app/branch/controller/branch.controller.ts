import { NextFunction, Request, Response } from "express";
import { BranchService } from "../service/branch.service";
import { validateBody } from "../../../lib/validation/validate";
import { CreateBranchDTO, UpdateBranchDTO, UpdateBranchStatusDTO } from "../DTO/branch..DTO";
import { SystemRole } from "../../user/enums";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { sendSuccess } from "../../../lib/http/response";
import { BranchNotFound } from "../error";

@injectable()
export class BranchController{
    constructor( @inject(TOKENS.BranchService) private readonly branchService: BranchService){

    }

    create = async(req:Request , res:Response ,next:NextFunction)=>{
        try {
            const restaurantId = Number(req.params.restaurantId)
            const data = await validateBody(CreateBranchDTO,req.body);
            const branch = await this.branchService.create(restaurantId,req.user?.userId!,  req.user?.role! as SystemRole, data);
            sendSuccess(res,{message:"branch created", branch},201);            
        } catch (err) {
            next(err);
        }
    }

    findNearby = async(req:Request , res:Response ,next:NextFunction)=>{
        try {
            const results = await this.branchService.findNearby(Number(req.query.lat), Number(req.query.lng));
            sendSuccess(res, results)
        } catch (err) {
            next(err);
        }
    }
    findByRestaurant= async(req:Request , res:Response ,next:NextFunction)=>{
        try {
            const results = await this.branchService.findByRestaurant(Number(req.params.restaurantId));
            sendSuccess(res, results)
            
        } catch (err) {
            next(err);
        }
    }

    update = async(req:Request , res:Response ,next:NextFunction)=>{
        try {
            const branchId = Number(req.params.id)
            const data = await validateBody(UpdateBranchDTO,req.body);
            const updated = await this.branchService.update(data,req.user?.userId!,  req.user?.role! as SystemRole, branchId);
            sendSuccess(res,{message:"branch  updated successfully", branch : updated});
            
        } catch (err) {
            next(err);
        }
    }

    updateStatus = async(req:Request , res:Response ,next:NextFunction)=>{
        try {
            const branchId = Number(req.params.id)
            const data = await validateBody(UpdateBranchStatusDTO,req.body);
            const branch = await this.branchService.updateStatus(data,  req.user?.role! as SystemRole, branchId);
            sendSuccess(res,{message:"branch status updated successfully", branch: {id:branch.id , isActive: branch.isActive, acceptOrders: branch.acceptOrders, commission: branch.commission}});
            
        } catch (err) {
            next(err);
        }
    }
    findByIdWithRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const result = await this.branchService.findByIdWithRestaurant(id);
            if (!result) throw BranchNotFound;
            const {branch, restaurantStatus} = result;
            sendSuccess(res, {
                id: branch.id,
                restaurantId: branch.restaurantId,
                restaurantStatus,
                region: branch.countryCode,
                isActive: branch.isActive,
                acceptOrders: branch.acceptOrders,
                deliveryFee: branch.deliveryFee,
                commissionBps: branch.commission,
                currency: branch.currency,
                lat: Number(branch.lat),
                lng: Number(branch.lng),
                name: branch.label,
                addressText: branch.addressText,
            });
        } catch (err) {
            next(err);
        }
    }
}