import type { Request,Response,NextFunction } from 'express';

export const validateTransfer = (req: Request, res: Response, next: NextFunction) => {
    const { senderId, recipientId, amount } = req.body;
    if (typeof senderId !== 'number' || typeof recipientId !== 'number' || typeof amount !== 'number') {
        throw new Error('Invalid input types:IDs and amount must be numbers')
    }
    next()
}

export const validateDepositAndWithdrawal = (req: Request, res: Response, next: NextFunction) => {
  const { walletId, amount } = req.body;

  if (!walletId || !amount) {
    return res.status(400).json({ error: "Missing walletId or amount" });
  }
  if (amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than zero" });
  }

  next();
};