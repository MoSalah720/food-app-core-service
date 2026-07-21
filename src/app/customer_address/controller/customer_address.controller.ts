import { NextFunction, Request, Response } from "express";
import { CustomerAddressService } from "../service/customer_address.service";
import { validateBody } from "../../../lib/validation/validate";
import { CreateAddressDTO, UpdateAddressDTO } from "../DTO/address.DTO";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { sendSuccess } from "../../../lib/http/response";

@injectable()
export class CustomerAddressController{
    constructor( @inject(TOKENS.CustomerAddressService) private readonly customerAddressService:CustomerAddressService){

    }

    getAll =async(req:Request, res:Response , next:NextFunction)=>{
        try {
            const customer_address = await this.customerAddressService.
            getByUserId(req.user?.userId!);
            sendSuccess(res,customer_address);
            
        } catch (err) {
            next(err);
        }
    }
    create =async(req:Request, res:Response , next:NextFunction)=>{
       try {
         const data = await validateBody(CreateAddressDTO,req.body);
        const address = await this.customerAddressService.
        create(data,req.user?.userId!);
        sendSuccess(res,{message:"address added",address},201);
       } catch (err) {
        next(err);
       }
    }
    update= async(req:Request, res:Response , next:NextFunction)=>{
        try {
            const data = await validateBody(UpdateAddressDTO,req.body);
            const addressId = Number(req.params.addressId);
            const address = await this.customerAddressService.
            update(data,addressId,req.user?.userId!);

            sendSuccess(res,{message:"address updated", address});
        } catch (err) {
            next(err);
        }
    }
    remove= async(req:Request, res:Response , next:NextFunction)=>{
        try {
         const addressId = Number(req.params.addressId);
         const address = await this.customerAddressService.
         remove(addressId,req.user?.userId!);

         sendSuccess(res,{message:"address deleted", address});
        } catch (err) {
            next(err);
        }
    }
}