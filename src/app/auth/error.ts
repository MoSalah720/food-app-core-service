import { AppError } from "../../common/error/AppError";

export const UserAlreadyExistError = new AppError("User already exist with the same email or phone number", 400)

export const CannotSignUpAsSystemAdmin = new AppError("You can not sign up as system admin",403);

export const IncorrectCradentials = new AppError("Incorrect email or passord", 401);

export const InvalidOTPError = new AppError("Invalid OTP");

export const RestaurantDataIsRequiredError =new AppError("Restaurant data is required",400);