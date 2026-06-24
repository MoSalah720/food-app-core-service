import { NextFunction, Request, Response } from "express";
import { customerAddressService, CustomerAddressService } from "../service/customer_address.service";
import { validateBody } from "../../../common/validation/validate";
import { CreateAddressDTO, UpdateAddressDTO } from "../DTO/address.DTO";

export class CustomerAddressController{
    constructor(private readonly customerAddressService:CustomerAddressService){

    }

    getAll =async(req:Request, res:Response , next:NextFunction)=>{
        try {
            const Addresses = await this.customerAddressService.
            getByUserId(req.user?.userId!);
            res.status(200).json({data:Addresses});
            
        } catch (err) {
            next(err);
        }
    }
    create =async(req:Request, res:Response , next:NextFunction)=>{
       try {
         const data = await validateBody(CreateAddressDTO,req.body);
        const address = await this.customerAddressService.
        create(data,req.user?.userId!);
        res.status(201).json({message:"address added",address});
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

            res.status(200).json({message:"address updated", address});
        } catch (err) {
            next(err);
        }
    }
    remove= async(req:Request, res:Response , next:NextFunction)=>{
        try {
         const addressId = Number(req.params.addressId);
         const address = await this.customerAddressService.
         remove(addressId,req.user?.userId!);

         res.status(200).json({message:"address deleted", address});
        } catch (err) {
            next(err);
        }
    }
}
export const customerAddressController=new CustomerAddressController(customerAddressService);