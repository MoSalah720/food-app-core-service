import { Router } from "express";
import { authenticate } from "../../common/auth/guard";
import { customerAddressController } from "./controller/customer.addresses.controller";

export const customerRouter = Router();
customerRouter.get('/',authenticate,customerAddressController.getAll);
customerRouter.post('/',authenticate,customerAddressController.create);
customerRouter.patch('/:addressId',authenticate,customerAddressController.update);
customerRouter.delete('/:addressId',authenticate,customerAddressController.remove);
