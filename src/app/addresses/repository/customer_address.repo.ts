import { db } from "../../../common/knex/knex";
import { CustomerAddress } from "../entity/customer.address.entity";

const Address_COLUMNS=[
    'id',
    'user_id',
    'label',
    'country',
    'city',
    'street',
    'building',
    'apartment_number',
    'type',
    'lat',
    'lng',
    'is_default'
]
function toEntity(row:any):CustomerAddress{
    return new CustomerAddress({
        id: row.id,
        userId: Number(row.user_id),
        label: row.label,
        country: row.country,
        city: row.city,
        street: row.street,
        building: row.building,
        apartmentNumber: row.apartment_number,
        type: row.type,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        isDefault: row.is_default
    })
}
export async function findAddressesByUserId(userId:number):Promise<CustomerAddress[]>{
    const row = await db('customer_addresses')
    .select(Address_COLUMNS).where('user_id',userId);

    return row.map(toEntity);
}

export async function findAddressById(id:number):Promise<CustomerAddress| undefined>{
    const row = await db('customer_addresses')
    .select(Address_COLUMNS).where('id',id).
    first();

    return row? toEntity(row):undefined;
}

export async function createAddress(Address:Partial<CustomerAddress>):Promise<CustomerAddress>{
    const [row]= await db('customer_addresses').insert({
        user_id:Address.userId,
        label: Address.label,
        country: Address.country,
        city: Address.city,
        street: Address.street,
        building: Address.building,
        apartment_number: Address.apartmentNumber,
        type: Address.type,
        lat: Address.lat,
        lng: Address.lng,
        is_default: Address.isDefault
    }).returning(Address_COLUMNS);

    return toEntity(row);
}

export async function updateAddress(id: number , data: Record<string,any>):Promise<CustomerAddress>{
    const mapped: Record<string,any> = {};
    if (data.label !== undefined) mapped.label = data.label;
    if (data.country !== undefined) mapped.country = data.country;
    if (data.city !== undefined) mapped.city = data.city;
    if (data.street !== undefined) mapped.street = data.street;
    if (data.building !== undefined) mapped.building = data.building;
    if (data.apartmentNumber !== undefined) mapped.apartment_number = data.apartmentNumber;
    if (data.type !== undefined) mapped.type = data.type;
    if (data.lat !== undefined) mapped.lat = data.lat;
    if (data.lng !== undefined) mapped.lng = data.lng;
    if (data.isDefault !== undefined) mapped.is_default = data.isDefault;

    const [row]= await db('customer_addresses')
    .update(mapped).where('id',id)
    .returning(Address_COLUMNS);

    return toEntity(row);
}

export async function deleteCustomerAddress(id:number) {
    await db('customer_addresses').delete().where('id',id);
}

export async function clearDefaultAddresses(userId: number) {
    await db("customer_addresses")
        .where("user_id", userId)
        .where("is_default",true)
        .update({ is_default: false });
}
