import { Knex } from "knex";
import { Branch } from "../entity/branch.entity";
import { db } from "../../../common/knex/knex";
import { promises } from "node:dns";

const BRANCH_COLUMNS = [
    'id',
    'restaurant_id',
    'country_code',
    'address_text',
    'label',
    'lat',
    'lng',
    'is_active',
    'opens_at',
    'closes_at',
    'accept_orders',
    'created_at',
    'updated_at',
    'delivery_radius',
    'currency',
    'commission'
];

function toEntity(row: any): Branch {
    return new Branch({
        id: row.id,
        restaurantId: row.restaurant_id,
        countryCode: row.country_code,
        addressText: row.address_text,
        label: row.label,
        lat: row.lat,
        lng: row.lng,
        isActive: row.is_active,
        opensAt: row.opens_at,
        closesAt: row.closes_at,
        acceptOrders: row.accept_orders,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deliveryRadius: row.delivery_radius,
        currency: row.currency,
        commission: row.commission
    });
}

export async function findBranchesByRestaurant(restaurantId:number):Promise<Branch[]> {
    const row = await db('restaurant_branches').select(BRANCH_COLUMNS)
    .where('restaurant_id',restaurantId);
    return row.map(toEntity);
}
export async function findBranchById(id:number):Promise<Branch> {
    const row = await db('restaurant_branches').select(BRANCH_COLUMNS)
    .where('id',id).first();
    return toEntity(row) ;
}

export async function createBranch(data:Partial<Branch>, conn:Knex=db):Promise<Branch> {
    const [row]= await conn("restaurant_branches").insert({
        id: data.id,
        restaurant_id: data.restaurantId,
        country_code: data.countryCode,
        address_text: data.addressText,
        label: data.label,
        lat: data.lat,
        lng: data.lng,
        is_active: data.isActive,
        opens_at: data.opensAt,
        closes_at: data.closesAt,
        accept_orders: data.acceptOrders,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
        delivery_radius: data.deliveryRadius,
        currency: data.currency,
        commission: data.commission
    }).returning(BRANCH_COLUMNS);

    return toEntity(row);
}

export async function findNearbyBranches(lat:number, lng:number): Promise<any[]> {
    const result = await db.raw(`
        SELECT 
        b.id,
        b.restaurant_id,
        b.address_text,
        b.label,
        b.lat,
        b.lng,
        b.is_active,
        b.accept_orders,
        b.currency,
        r.name,
        r.logo_url
        from restaurant_branches b join restaurants r ON b.restaurant_id = r.id
        where b.is_active = true AND r.status ='active'
        AND ST_DWITHIN(b.location , ST_MAKEPOINT(?,?)::geography , b.delivery_radius*1000)
        `,[lng,lat]);
        return result.rows
    
}

export async function updateBranch(id:number , data:Record<string,any>):Promise<Branch> {
    const mapped: Record<string,any> ={};
    if (data.addressText !== undefined) mapped.address_text = data.addressText;
    if (data.label !== undefined) mapped.label = data.label;
    if (data.lat !== undefined) mapped.lat = data.lat;
    if (data.lng !== undefined) mapped.lng = data.lng;
    if (data.opensAt !== undefined) mapped.opens_at = data.opensAt;
    if (data.closesAt !== undefined) mapped.closes_at = data.closesAt;
    if (data.deliveryRadius !== undefined) mapped.delivery_radius = data.deliveryRadius;
    if (data.currency !== undefined) mapped.currency = data.currency;
    if (data.acceptOrders !== undefined) mapped.accept_orders = data.acceptOrders;
    const [row] =await db('restaurant_branches').update({
        ...mapped,
        updated_at: new Date()
    }).where('id',id).returning(BRANCH_COLUMNS);
    
    return toEntity(row);    
}

export async function updateBranchStatus(id:number , data:Record<string,any>):Promise<Branch> {
    const mapped: Record<string,any> ={};
    if(data.isActive !== undefined) mapped.is_active = data.isActive;
     if(data.commission !== undefined) mapped.commission = data.commission;

    const [row] =await db('restaurant_branches').update({
        ...mapped,
        updated_at: new Date()
    }).where('id',id).returning(BRANCH_COLUMNS);
    
    return toEntity(row);    
}

