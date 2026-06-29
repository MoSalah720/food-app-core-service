import { AppError } from "../../common/error/AppError";

export const BranchNotFound =new AppError("Branch not found", 404);