import { NextFunction, Request, Response } from "express";
import { ProductService } from "../service/product.service";
import { SystemRole } from "../../user/enums";
import { CreateProductDTO, UpdateProductDTO } from "../DTO/productDTO";
import { validateBody } from "../../../lib/validation/validate";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { sendSuccess } from "../../../lib/http/response";
import { MissingProductIdsQueryError, InvalidReserveItemsError } from "../error";


@injectable()
export class ProductController{
    constructor( @inject(TOKENS.ProductService) private readonly productService:ProductService){

    }
    findCategories = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const categories =await this.productService.findCategories(Number(req.params.restaurantId));
            sendSuccess(res,{data:categories});
        } catch (err) {
            next(err);
        }
    }
    findByBranch = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const products = await this.productService.findByBranch(Number(req.params.branchId));
            sendSuccess(res,{data: products});
        } catch (err) {
            next(err);
        }
    }

    findByRestaurant = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const products = await this.productService.findByRestaurant(Number(req.params.restaurantId),
             req.user?.userId! ,req.user?.role! as SystemRole);
            sendSuccess(res,{data: products});
        } catch (err) {
            next(err);
        }
    }
    findById = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const product = await this.productService.findById(Number(req.params.id));
            sendSuccess(res,product);
        } catch (err) {
            next(err)
        }
    }
    create = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const data = await validateBody(CreateProductDTO, req.body);
            const product = await this.productService.create(data, Number(req.params.restaurantId),
             req.user?.role! as SystemRole, req.user?.userId!);
            sendSuccess(res,{message:"Product added successfully",product:product},201);
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
            sendSuccess(res,{message: "Product updated", ...result});
        } catch (err) {
            next(err)
        }
    }

    findByBranchAndIds = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branchId = Number(req.params.id);
            const raw = typeof req.query.ids === "string" ? req.query.ids : "";
            const ids = raw.split(",").map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n > 0);
            if (ids.length === 0) throw MissingProductIdsQueryError;
            const products = await this.productService.findByBranchAndIds(branchId, ids);
            sendSuccess(res, products);
        } catch (err) {
            next(err);
        }
    }

    reserveStock = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branchId = Number(req.params.id);
            const items = req.body?.items;
            if (!Array.isArray(items) || items.length === 0) {
                throw InvalidReserveItemsError;
            }
            const result = await this.productService.reserveStock(branchId, items);
            sendSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }
}