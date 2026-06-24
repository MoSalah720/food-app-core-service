import { CreateAddressDTO, UpdateAddressDTO } from "../DTO/address.DTO";
import { AddressNotFound } from "../error";
import { clearDefaultAddresses, createAddress, deleteCustomerAddress, findAddressById, findAddressesByUserId, updateAddress } from "../repository/customer_address.repo";


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
export class CustomerAddressService{
    getByUserId = async(userId:number)=>{
       const addresses =await findAddressesByUserId(userId);
       return addresses.map(toResponse);
    }
    create = async(data:CreateAddressDTO, userId:number)=>{
        if (data.isDefault) {
           await clearDefaultAddresses(userId);
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
            await clearDefaultAddresses(userId);
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


export const customerAddressService = new CustomerAddressService();