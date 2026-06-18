import { AppError } from "../../common/error/AppError";

export const UserAlreadyExistError = new AppError("User already exist with the same email or phone number", 400)

export const CannotSignUpAsSystemAdmin = new AppError("You can not sign up as system admin",403);