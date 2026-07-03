import { Router } from "express";
import { productController } from "./controller/product.controller";
import { authenticate } from "../../common/auth/guard";

export const productRouter =Router();

productRouter.get('/restaurants/:restaurantId/categories',productController.findCategories);
productRouter.get('/branches/:branchId/products', productController.findByBranch);
productRouter.get('/restaurants/:restaurantId/products', authenticate ,productController.findByRestaurant);
productRouter.get('/products/:id',productController.findById);
productRouter.post('/restaurants/:restaurantId/products', authenticate ,productController.create);
productRouter.patch('/products/:id', authenticate ,productController.update);

