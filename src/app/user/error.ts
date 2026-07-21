import { AppError } from "../../lib/error/AppError";

export const UserNotFound = new AppError("User not found ", 404);