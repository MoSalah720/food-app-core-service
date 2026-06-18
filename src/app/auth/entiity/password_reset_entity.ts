export class PasswordReset{
    id: number;
    userId: number;
    otpHash: string;
    createdAt: Date
    expiresAt: Date;
    consumedAt: Date | null;

    constructor(id: number, userId: number, otpHash: string, createdAt: Date, expiresAt: Date, consumedAt: Date | null){
        this.id = id;
        this.userId = userId;
        this.otpHash = otpHash;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.consumedAt = consumedAt;
    }
    
 isExpired(): boolean {
    return this.expiresAt < new Date();
}
}

