import type { Request,Response,NextFunction } from 'express';

export const validateTransfer = (req: Request, res: Response, next: NextFunction) => {
    const { senderId, recipientId, amount } = req.body;
    if (typeof senderId !== 'number' || typeof recipientId !== 'number' || typeof amount !== 'number') {
        throw new Error('Invalid input types:IDs and amount must be numbers')
    }
    next()
}