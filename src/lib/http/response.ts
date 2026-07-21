import { Response } from "express";

export interface ApiResponse<T= unknown> {
    success: boolean;
    data?: T;
    meta?: object;
}

export interface PaginationMeta{
    nextCursor: number|null;
    hasMore: boolean;
    count: number;
}

export function sendSuccess<T>(res: Response, data: T,statusCode =200, meta?: object): void {
    const body: ApiResponse<T> = {success: true, data};

    if (meta) body.meta = meta;
    res.status(statusCode).json(body);
}

export function sendPagination<T>(res: Response, data: T[], meta: PaginationMeta): void {
    res.status(200).json({success: true, data, meta});
}