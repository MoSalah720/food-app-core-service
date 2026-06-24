import { date } from "zod";

export class PasswordReset{
    id: number;
    userId: number;
    otpHash: string;
    createdAt: Date
    expiresAt: Date;
    consumedAt: Date | null;

    constructor(data:Partial<PasswordReset>){
        this.id = data.id!;
        this.userId = data.userId!;
        this.otpHash = data.otpHash!;
        this.createdAt = data.createdAt!;
        this.expiresAt = data.expiresAt!;
        this.consumedAt = data.consumedAt??null;
    }
    
 isExpired(): boolean {
    return this.expiresAt < new Date();
}
}

