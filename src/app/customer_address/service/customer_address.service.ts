import { injectable } from "tsyringe";
import { CreateAddressDTO, UpdateAddressDTO } from "../DTO/address.DTO";
import { AddressNotFound } from "../error";
import { clearDefaultcustomer_address, createAddress, deleteCustomerAddress, findAddressById, findcustomer_addressByUserId, updateAddress } from "../repository/customer_address.repo";


 function toResponse(address: any) {
    return {
        id: address.id,
        label: address.label,
        country: address.country,
        city: address.city,
        street: address.street,
        building: address.building,
        apartmentNumber: address.apartmentNumber,
        type: address.type,
        lat: address.lat,
        lng: address.lng,
        isDefault: address.isDefault
    };
}
@injectable()
export class CustomerAddressService{
    getByUserId = async(userId:number)=>{
       const customer_address =await findcustomer_addressByUserId(userId);
       return customer_address.map(toResponse);
    }
    create = async(data:CreateAddressDTO, userId:number)=>{
        if (data.isDefault) {
           await clearDefaultcustomer_address(userId);
        }
       const address = await createAddress({userId, ...data});

       return toResponse(address);
    }

    update = async(data:UpdateAddressDTO, addressId:number,userId:number)=> {
        const existing = await findAddressById(addressId);
        if (!existing|| existing.userId !== userId) {
            throw AddressNotFound
        }
        
        if (data.isDefault) {
            await clearDefaultcustomer_address(userId);
        }

        const updated = await updateAddress(addressId , data);
        return  toResponse(updated);
    }

    remove = async(addressId:number,userId:number)=>{
         const existing = await findAddressById(addressId);
        if (!existing|| existing.userId !== userId) {
            throw AddressNotFound
        }
        await deleteCustomerAddress(addressId);
    };
}