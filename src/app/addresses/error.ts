import { AppError } from "../../common/error/AppError";

export const CustomerNotFound =new AppError("Customer not found", 404);
export const NoAddressesAddedForThisCustomer =new AppError("No addresses added for this customer ",404);
export const AddressNotFound =new AppError("Address not found ",404);