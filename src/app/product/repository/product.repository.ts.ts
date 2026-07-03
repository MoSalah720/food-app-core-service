import ro from "zod/v4/locales/ro.js";
import { db } from "../../../common/knex/knex";
import { Product } from "../entity/product.entity";
import { Knex } from "knex";

const PRODUCT_COLUMNS = [
    'id',
    'restaurant_id',
    'category_id',
    'name',
    'description',
    'image_url',
    'created_at',
    'updated_at',
    'deleted_at'
];
function toEntity(row: any): Product {
    return new Product({
        id: row.id,
        restaurantId: row.restaurant_id,
        categoryId: row.category_id,
        name: row.name,
        description: row.description,
        imageURL: row.image_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at
    });
}

export async function findProductsByBranch (branchId:number){
    const rows = await db("products as p")
        .join("product_branch_details as pbd", "p.id", "pbd.product_id")
        .leftJoin("product_categories as pc", "p.category_id", "pc.id")
        .where("pbd.branch_id", branchId)
        .whereNull("p.deleted_at")
        .select(
            "p.id",
            "p.name",
            "p.description",
            "p.image_url",
            "p.restaurant_id",
            "p.category_id",
            "pc.name as category_name",
            "pbd.price",
            "pbd.stock",
            "pbd.is_available",
        );
    return rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        imageUrl: row.image_url,
        restaurantId: row.restaurant_id,
        categoryId: row.category_id,
        categoryName: row.category_name,
        price: row.price,
        stock: row.stock,
        isAvailable: row.is_available,
    }));
}

export async function findProductsByRestaurant (restaurantId:number):Promise<Product[]> {
    const row = await db('products').select(PRODUCT_COLUMNS)
    .where('restaurant_id',restaurantId);
    return row.map(toEntity);
}

export async function findProductsById (id:number):Promise<Product|undefined> {
    const row = await db('products').select(PRODUCT_COLUMNS)
    .where('id',id).whereNull('deleted_at').first();
    return row? toEntity(row):undefined;
}
export async function createProduct(data:Partial<Product>, conn:Knex = db):Promise<Product>{
    const [row]= await conn('products').insert({
        id: data.id,
        name: data.name,
        description: data.description,
        image_url: data.imageURL,
        restaurant_id: data.restaurantId,
        category_id: data.categoryId,
        created_at: data.createdAt,
        updated_at: data.updatedAt
    }).returning(PRODUCT_COLUMNS);  
    return toEntity(row);
}
export async function updateProduct(id:number , data:Record<string,any>, conn:Knex = db):Promise<Product>{
   const [row] = await conn('products').update({
    name:data.name,
    description: data.description,
    image_url: data.imageURL,
    category_id: data.categoryId,
     updated_at: data.updatedAt
   }).where('id',id).returning(PRODUCT_COLUMNS);
   return toEntity(row);
}