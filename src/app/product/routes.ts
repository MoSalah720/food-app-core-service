import { Router } from "express";
import { ProductController } from "./controller/product.controller";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireBranchAccess, requireRestaurantMember } from "../../lib/auth/rbac";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";

export const productRouter =Router();

const productController = container.resolve<ProductController>(TOKENS.ProductController);

productRouter.get('/restaurants/:restaurantId/categories',productController.findCategories);
productRouter.get('/branches/:branchId/products', productController.findByBranch);
productRouter.get('/products/:id',productController.findById);

productRouter.get('/restaurants/:restaurantId/products',
    authenticate,
     requireRestaurantMember('restaurantId'),
     rbac({resource:'core:product',action:'read'}),
     productController.findByRestaurant);

productRouter.post('/restaurants/:restaurantId/products',
     authenticate ,
     requireRestaurantMember('restaurantId')
    ,rbac({resource:'core:product',action:'create'}),
    productController.create);

productRouter.patch('/products/:id', 
    authenticate,
    requireBranchAccess('branchId'),
    rbac({resource:'core:product',action:'update'}) ,
    productController.update);

