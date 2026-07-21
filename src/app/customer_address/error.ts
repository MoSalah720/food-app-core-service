import { AppError } from "../../lib/error/AppError";

export const CustomerNotFound =new AppError("Customer not found", 404);
export const Nocustomer_addressAddedForThisCustomer =new AppError("No customer_address added for this customer ",404);
export const AddressNotFound =new AppError("Address not found ",404);