import { NextFunction , Request , Response } from "express";
import { productService, ProductService } from "../service/product.service";
import { SystemRole } from "../../user/enums";
import { CreateProductDTO, UpdateProductDTO } from "../DTO/productDTO";
import { validateBody } from "../../../common/validation/validate";

export class ProductController{
    constructor(private readonly productService:ProductService){

    }
    findCategories = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const categories =await this.productService.findCategories(Number(req.params.restaurantId));
            res.status(200).json({data:categories});
        } catch (err) {
            next(err);
        }
    }
    findByBranch = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const products = await this.productService.findByBranch(Number(req.params.branchId));
            res.status(200).json({data: products});
        } catch (err) {
            next(err);
        }
    }

    findByRestaurant = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const products = await this.productService.findByRestaurant(Number(req.params.restaurantId),
             req.user?.userId! ,req.user?.role! as SystemRole);
            res.status(200).json({data: products});
        } catch (err) {
            next(err);
        }
    }
    findById = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const product = await this.productService.findById(Number(req.params.id));
            res.status(200).json(product);
        } catch (err) {
            next(err)
        }
    }
    create = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const data = await validateBody(CreateProductDTO, req.body);
            const product = await this.productService.create(data, Number(req.params.restaurantId),
             req.user?.role! as SystemRole, req.user?.userId!);
            res.status(201).json({message:"Product added successfully",product:product});
        } catch (err) {
            next(err)
        }
    }
    update = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const data = await validateBody(UpdateProductDTO, req.body);
            const branchId = req.query.branchId ? Number(req.query.branchId) : undefined;
            const result = await this.productService.update(data, Number(req.params.id),
             req.user?.role! as SystemRole, req.user?.userId!,branchId);
            res.status(200).json({message: "Product updated", ...result});
        } catch (err) {
            next(err)
        }
    }
}
export const productController = new ProductController(productService);