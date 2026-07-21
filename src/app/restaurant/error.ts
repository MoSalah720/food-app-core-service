import { AppError } from "../../lib/error/AppError";

export const RestaurantNotFound =new AppError("Restaurant not found ", 404);
export const UserMustBeASYSTEMADMIN =new AppError("User must be a System_Admin ", 400);
export const UserMustBeAOwnerOrAdmin =new AppError("User must be a Owner or System_Admin ", 400);

