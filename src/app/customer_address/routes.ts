import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { CustomerAddressController } from "./controller/customer_address.controller";

export const customerRouter = Router();

const customerAddressController = container.resolve<CustomerAddressController>(TOKENS.CustomerAddressController);
customerRouter.get('/',authenticate,customerAddressController.getAll);
customerRouter.post('/',authenticate,customerAddressController.create);
customerRouter.patch('/:addressId',authenticate,customerAddressController.update);
customerRouter.delete('/:addressId',authenticate,customerAddressController.remove);
