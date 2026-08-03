import { injectable } from "tsyringe";
import { unAuthorizedError } from "../../../lib/auth/error";
import { db } from "../../../lib/knex/knex";
import { BranchNotFound } from "../../branch/error";
import { findBranchById } from "../../branch/repository/branch.repo";
import { RestaurantNotFound } from "../../restaurant/error";
import { findRestaurantById } from "../../restaurant/repository/restaurant.repo";
import { SystemRole } from "../../user/enums";
import { CreateProductDTO, UpdateProductDTO } from "../DTO/productDTO";
import { InvalidReserveItemsError, outOfStockError, ProductNotFound } from "../error";
import { createCategory, findCategoriesByRestaurant, findCategoryByName } from "../repository/category.repository.ts";
import { updateBranchDetails } from "../repository/product-branch-details.repository.ts";
import { createProduct, findProductsByBranch, findProductsById, findProductsByRestaurant, updateProduct } from "../repository/product.repository.ts";
import { EVENT_TYPES } from "../../../lib/events/event_types";
import { insertOutBoxEvent, insertOutboxEventsBatch } from "../../../lib/events/outbox.repo";
import { BranchProductRow, ReserveStockInput, ReserveStockResult, OutOfStockItem, ReserveStockApplied } from "../types";

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

@injectable()
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
   update = async (data: UpdateProductDTO, productId: number, userRole: SystemRole, userId: number, branchId?: number) => {
    const product = await findProductsById(productId);
    if (!product) throw ProductNotFound;

    const restaurant = await findRestaurantById(product.restaurantId);
    if (!restaurant) throw RestaurantNotFound;

    const isAdmin = userRole === SystemRole.SYSTEM_ADMIN;
    const isOwner = Number(restaurant.ownerId) === Number(userId);
    if (!isAdmin && !isOwner) throw unAuthorizedError;

    const now = new Date();
    let categoryId: number | undefined = undefined;
    let updatedProduct;
    let branchDetails;

    const trx = await db.transaction();

    try {
        if (data.categoryName) {
            let category = await findCategoryByName(product.restaurantId, data.categoryName);
            if (!category) {
                category = await createCategory(product.restaurantId, data.categoryName, trx);
            }
            categoryId = category.id;
        }

        updatedProduct = await updateProduct(product.id, {
            name: data.name,
            description: data.description,
            imageURL: data.imageURL,
            categoryId,
            updatedAt: now
        }, trx);

        if (branchId && (data.price !== undefined || data.stock !== undefined || data.isAvailable !== undefined)) {
            
            branchDetails = await updateBranchDetails(product.id, branchId, {
                price: data.price,
                stock: data.stock,
                isAvailable: data.isAvailable
            }, trx);

            const outboxEvents = [];

            if (data.price !== undefined) {
                outboxEvents.push({
                    aggregateType: "product_branch_details",
                    aggregateId: `${branchId}:${productId}`,
                    eventType: EVENT_TYPES.PRODUCT_PRICE_CHANGED,
                    payload: { branchId, productId, newPrice: branchDetails.price }
                });
            }

            if (data.stock !== undefined || data.isAvailable !== undefined) {
                outboxEvents.push({
                    aggregateType: "product_branch_details",
                    aggregateId: `${branchId}:${productId}`,
                    eventType: EVENT_TYPES.PRODUCT_STOCK_CHANGED,
                    payload: {
                        branchId,
                        productId,
                        newStock: branchDetails.stock,
                        isAvailable: branchDetails.isAvailable,
                    }
                });
            }

            if (outboxEvents.length > 0) {
                await insertOutboxEventsBatch(trx, outboxEvents); 
            }
        }

        await trx.commit();

    } catch (error) {
        await trx.rollback();
        throw error;
    }

    return {
        product: toProductResponse(updatedProduct),
        branchDetails: branchDetails ? toBranchDetailsResponse(branchDetails) : undefined  
    };
};
 findByBranchAndIds = async (branchId: number, productIds: number[]): Promise<BranchProductRow[]> => {
        if (productIds.length === 0) return [];
        const rows = await db("product_branch_details as pbd")
            .join("products as p", "p.id", "pbd.product_id")
            .where("pbd.branch_id", branchId)
            .whereIn("pbd.product_id", productIds)
            .whereNull("p.deleted_at")
            .select(
                "pbd.product_id",
                "p.name",
                "p.image_url",
                "pbd.price",
                "pbd.stock",
                "pbd.is_available",
            );
        return rows.map((r: any) => ({
            productId: r.product_id,
            name: r.name,
            imageUrl: r.image_url,
            price: r.price,
            stock: r.stock,
            isAvailable: r.is_available,
        }));
    }

    /**
     * Atomically decrements branch stock for each item. Locks the rows FOR UPDATE
     * and emits product.stock.changed per decrement so order-service invalidates
     * its cache.
     */
    reserveStock = async (branchId: number, items: ReserveStockInput[]): Promise<ReserveStockResult> => {
        const sanitized = items
            .map((it) => ({productId: Number(it.productId), quantity: Number(it.quantity)}))
            .filter((it) => Number.isInteger(it.productId) && Number.isInteger(it.quantity) && it.quantity > 0);

        if (sanitized.length !== items.length) {
            throw InvalidReserveItemsError;
        }

        const productIds = sanitized.map((i) => i.productId);

        const trx = await db.transaction();
        try {
            const rows = await trx("product_branch_details")
                .where("branch_id", branchId)
                .whereIn("product_id", productIds)
                .select("product_id", "stock", "is_available")
                .forUpdate();

            const byProduct = new Map<number, {stock: number; isAvailable: boolean}>();
            for (const r of rows) byProduct.set(Number(r.product_id), {stock: r.stock, isAvailable: r.is_available});

            const offending: OutOfStockItem[] = [];
            for (const it of sanitized) {
                const current = byProduct.get(it.productId);
                if (!current || !current.isAvailable) {
                    offending.push({productId: it.productId, requested: it.quantity, available: 0});
                    continue;
                }
                if (current.stock < it.quantity) {
                    offending.push({productId: it.productId, requested: it.quantity, available: current.stock});
                }
            }

            if (offending.length > 0) {
                throw outOfStockError(offending);
            }

            const applied: ReserveStockApplied[] = [];
            for (const it of sanitized) {
                const newStock = byProduct.get(it.productId)!.stock - it.quantity;
                await trx("product_branch_details")
                    .where("branch_id", branchId)
                    .where("product_id", it.productId)
                    .update({stock: newStock});
                applied.push({productId: it.productId, newStock});
            }

            for (const a of applied) {
                await insertOutBoxEvent(trx, {
                    aggregateType: "product_branch_details",
                    aggregateId: `${branchId}:${a.productId}`,
                    eventType: EVENT_TYPES.PRODUCT_STOCK_CHANGED,
                    payload: {branchId, productId: a.productId, newStock: a.newStock},
                });
            }

            await trx.commit();
            return {ok: true, applied};
        } catch (err) {
            await trx.rollback();
            throw err;
        }
    }
        
}