import knex, { Knex } from "knex";
import { Restaurant } from "../entity/restaurant.entity";
import { db } from "../../../lib/knex/knex";
import { RestaurantStatus } from "../enums";

const RESTAURANT_COLUMNS = ['id' , 'owner_id' , 'name' ,'logo_url' , 'status' ,
    'primary_country' ,  'created_at', 'updated_at','status_updated_at'
]

function toEntity(row:any):Restaurant {
    return new Restaurant({
        id : Number(row.id),
        ownerId: Number(row.owner_id),
        name: row.name,
        logoURL:row.logo_url,
        status: row.status,
        primaryCountry: row.primary_country,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        statusUpdatedAt: row.status_updated_at
    });
}

export async function findAllRestaurant():Promise<Restaurant[]> {
    const row = await db('restaurants').select(RESTAURANT_COLUMNS);
    return row.map(toEntity);
}


export async function findRestaurantById(id:number): Promise<Restaurant |undefined>{
    const row = await db('restaurants').select(RESTAURANT_COLUMNS)
    .where('id',id).first();

    return row? toEntity(row): undefined
}

export async function createRestaurant(data: Partial<Restaurant>, conn: Knex =db): Promise<Restaurant>{
    const [row] =await conn('restaurants').insert({
        id: data.id,
        owner_id: data.ownerId,
        name: data.name,
        logo_url: data.logoURL,
        status: data.status,
        primary_country: data.primaryCountry,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
        status_updated_at: data.statusUpdatedAt
    }).returning(RESTAURANT_COLUMNS);
    return toEntity(row);
}

export async function updateRestaurant(id:number, data: Record<string,any>):Promise <Restaurant>{
    const mapped:Record<string, any> ={};
    if (data.name !== undefined) mapped.name = data.name;
    if (data.logoURL !== undefined) mapped.logo_url = data.logoURL;
    if (data.primaryCountry !== undefined) mapped.primary_country = data.primaryCountry;

    const [row] =await db('restaurants').
    update({...mapped,
        updated_at:new Date()
    })
    .where('id',id).returning(RESTAURANT_COLUMNS);

    return toEntity(row);

}

export async function updataRestaurantStatus(id:number, status:RestaurantStatus): Promise<Restaurant>{
    const [row] =await db('restaurants').update({
        status:status,
        updated_at:new Date(),
         status_updated_at:new Date()
    }).
    where('id',id).returning(RESTAURANT_COLUMNS);

    return toEntity(row);
}