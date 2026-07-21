import { AppError } from "../../lib/error/AppError";

export const BranchNotFound =new AppError("Branch not found", 404);