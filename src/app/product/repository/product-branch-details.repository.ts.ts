import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { ProductBranchDetail } from "../entity/product-branch-details.entity";

const PRODUCT_BRANCH_DETAILS_COLUMNS = [
    'id',
    'branch_id',
    'product_id',
    'price',
    'stock',
    'is_available'
];
function toEntity(row: any): ProductBranchDetail {
    return new ProductBranchDetail({
        id: row.id,
        branchId: row.branch_id,
        productId: row.product_id,
        price: row.price,
        stock: row.stock,
        isAvailable: row.is_available
    });
}
export async function updateBranchDetails(productId:number,branchId:number,
    data:{price?:number,stock?:number,isAvailable?:boolean},conn:Knex=db):Promise<ProductBranchDetail> {
    const [row] = await conn('product_branch_details').where('branch_id',branchId).where('product_id',productId)
    .update({
        price:data.price,
        stock:data.stock,
        is_available:data.isAvailable
    }).returning(PRODUCT_BRANCH_DETAILS_COLUMNS);
    return toEntity(row);
}