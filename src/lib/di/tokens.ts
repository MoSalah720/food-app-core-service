import { symbol } from "zod";

export const TOKENS = {
    //services
    AuthService: Symbol.for('AuthService'),
    UserService: Symbol.for('UserService'),
    RestaurantService: Symbol.for('RestaurantService'),
    BranchService: Symbol.for('BranchService'),
    ProductService: Symbol.for('ProductService'),
    MemberService: Symbol.for('MemberService'),
    CustomerAddressService: Symbol.for('CustomerAddressService'),
    PermissionCacheService: Symbol.for('PermissionCacheService'),

    //controllers
    AuthController: Symbol.for('AuthController'),
    UserController: Symbol.for('UserController'),
    RestaurantController: Symbol.for('RestaurantController'),
    BranchController: Symbol.for('BranchController'),
    ProductController: Symbol.for('ProductController'),
    MemberController: Symbol.for('MemberController'),
    CustomerAddressController: Symbol.for('CustomerAddressController'),

    //lib/ infra 
    Logger: Symbol.for('Logger'),

    CacheProvider: Symbol.for('CacheProvider'),
    EmailProvider:Symbol.for('EmailProvider')    

}