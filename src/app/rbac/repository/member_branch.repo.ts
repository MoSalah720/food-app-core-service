import { Knex } from "knex";
import { MemberBranch } from "../entity/member_branch";
import { db } from "../../../lib/knex/knex";

export const MEMBER_BRANCH_COLUMNS = [
    "member_id",
    "branch_id",
    "updated_at",
];
function toEntity(row: any): MemberBranch {
    return new MemberBranch({
        memberId: row.member_id,
        branchId: row.branch_id,
        createdAt: row.created_at,
    });
}

export async function setMemberBranches(memberId:number , rows:MemberBranch[], trx?: Knex.Transaction){
    const query = trx || db;

    await query('member_branches').where('member_id',memberId).delete();

    if (rows.length > 0) {
        await query('member_branches').insert(
            rows.map(row=>({
                member_id: row.memberId,
                branch_id: row.branchId,
                created_at: row.createdAt
            }))
        )
    }
}

export async function findBranchIdsByMemberId(memberId: number):Promise<number[]> {
    const rows = await db('member_branches').select('branch_id')
    .where('member_id',memberId);
    return rows.map(row => row.branch_id);
}


export async function countBranchesByIdsAndRestaurant(branchIds:number[] ,restaurantId:number):Promise<number> {
     const [{count}] = await db("restaurant_branches")
        .whereIn("id", branchIds)
        .andWhere("restaurant_id", restaurantId)
        .count("id as count");
    return Number(count);
}