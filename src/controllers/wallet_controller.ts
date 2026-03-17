import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as walletService from '../services/wallet_service.js';

interface TransferBody {
  senderId: number;
  recipientId: number;
  amount: number;
}

export const handleTransfer = asyncHandler(async (
  req: Request<{}, {}, TransferBody>, 
  res: Response
) => {
  const { senderId, recipientId, amount } = req.body;

  const result = await walletService.transferFunds(
    Number(senderId), 
    Number(recipientId), 
    Number(amount)
  );
  
  res.status(200).json({ 
    success: true, 
    data: result 
  });
});
