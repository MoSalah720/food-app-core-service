import { unAuthorizedError } from "../../../common/auth/error";
import { db } from "../../../common/knex/knex";
import { BranchNotFound } from "../../branch/error";
import { findBranchById } from "../../branch/repository/branch.repo";
import { RestaurantNotFound } from "../../restaurant/error";
import { findRestaurantById } from "../../restaurant/repository/restaurant.repo";
import { SystemRole } from "../../user/enums";
import { CreateProductDTO, UpdateProductDTO } from "../DTO/productDTO";
import { ProductNotFound } from "../error";
import { createCategory, findCategoriesByRestaurant, findCategoryByName } from "../repository/category.repository.ts";
import { updateBranchDetails } from "../repository/product-branch-details.repository.ts";
import { createProduct, findProductsByBranch, findProductsById, findProductsByRestaurant, updateProduct } from "../repository/product.repository.ts";

function toCategoryResponse(category:any){
    return {
        id: category.id,
        restaurantId: category.restaurantId,
        name: category.name,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
    };
}

function toProductResponse(product: any) {
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        imageURL: product.imageURL,
        restaurantId: product.restaurantId,
        categoryId: product.categoryId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
    };
}

function toBranchDetailsResponse(pbd: any){
    return {
        productId : pbd.productId,
        branchId : pbd.branchId,
        price : pbd.price,
        stock : pbd.stock,
        isAvailable : pbd.isAvailable
    }
}


export class ProductService{
    findCategories = async(restaurantId:number)=>{
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) {
            throw RestaurantNotFound;
        }
        const categories =await findCategoriesByRestaurant(restaurant.id);

        return categories.map(toCategoryResponse);
    }

    findByBranch = async (branchId: number)=>{
        const branch = await findBranchById(branchId);
        if (!branch) {
            throw BranchNotFound;
        }
        return  await findProductsByBranch(branch.id);
    }

    findByRestaurant = async(restaurantId:number, userId:number ,userRole:SystemRole)=>{
         const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) {
            throw RestaurantNotFound;
        }
        
        const isAdmin = userRole === SystemRole.SYSTEM_ADMIN;
        const isOwner = restaurant.ownerId === userId;

        if (!isAdmin && !isOwner) {
            throw unAuthorizedError;
        }
       
        const products = await findProductsByRestaurant(restaurant.id);

        return products.map(toProductResponse);
    }   
    findById = async(productId:number)=>{
        const product = await findProductsById(productId);
        if (!product) {
            throw ProductNotFound;
        }
        return toProductResponse(product);
    }
    create = async(data:CreateProductDTO , restaurantId:number , userRole:SystemRole , userId:number)=>{
        const now = new Date();
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) {
            throw RestaurantNotFound;
        }
        
        const isAdmin = userRole === SystemRole.SYSTEM_ADMIN;
        const isOwner = restaurant.ownerId === userId;

        if (!isAdmin && !isOwner) {
            throw unAuthorizedError;
        }
       let categoryId: number | undefined = undefined;
       let product;
       const trx = await db.transaction();
       try{
       if (data.categoryName) {
        let category = await findCategoryByName(restaurantId,data.categoryName);
        if(!category){
            category = await createCategory(restaurantId,data.categoryName,trx);
        }
        categoryId = category.id;
    }
        product = await createProduct({
        name: data.name,
        description: data.description,
        imageURL: data.imageURL,
        restaurantId: restaurant.id,
        categoryId,
        createdAt: now,
        updatedAt: now
       },trx)
       await trx.commit();
    }catch(error){
        await trx.rollback();
        throw error;
    }
         return toProductResponse(product);
    }
    update = async(data:UpdateProductDTO , productId:number  , userRole:SystemRole , userId:number , branchId?:number)=>{
        const product = await findProductsById(productId);
        if (!product) {
            throw ProductNotFound;
        }
        const now = new Date();
        const restaurant = await findRestaurantById(product.restaurantId);
        if (!restaurant) {
            throw RestaurantNotFound;
        }
        
        const isAdmin = userRole === SystemRole.SYSTEM_ADMIN;
        const isOwner = restaurant.ownerId === userId;

        if (!isAdmin && !isOwner) {
            throw unAuthorizedError;
        }
         let categoryId: number | undefined = undefined;
         let updatedProduct;
         let branchDetails;
        const trx = await db.transaction();

        try {
            if (data.categoryName) {
                let category = await findCategoryByName(product.restaurantId,data.categoryName);
                if (!category) {
                    category = await createCategory(product.restaurantId, data.categoryName,trx);
                }
                categoryId = category.id;
            }
            updatedProduct = await updateProduct(product.id,{
                name : data.name,
                description: data.description,
                imageURL : data.imageURL,
                categoryId,
                updatedAt:now
            },trx) 
            if (branchId && (data.price!==undefined || data.stock!==undefined||data.isAvailable!==undefined)) {
                 branchDetails = await updateBranchDetails(product.id, branchId,{
                price: data.price,
                stock:data.stock,
                isAvailable:data.isAvailable
            },trx)
            }
           
            await trx.commit();
        } catch (error) {
            await trx.rollback();
            throw error;
        }
        return {
             product: toProductResponse(updatedProduct),
             branchDetails: branchDetails ? toBranchDetailsResponse(branchDetails) : undefined  
        }

    }
        
}

export const productService = new ProductService();