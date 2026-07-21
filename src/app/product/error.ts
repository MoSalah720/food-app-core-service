import { AppError } from "../../lib/error/AppError";

export const ProductNotFound =new AppError("product not found ", 404);
export const CategoryNotFound =new AppError("category not found ", 404);
