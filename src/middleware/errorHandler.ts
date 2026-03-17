import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

  console.error(`[${new Date().toISOString()}] ${err.stack || err.message}`);


  let statusCode = 500;
  if (err.message.includes('not found')) statusCode = 404;
  if (err.message.includes('funds') || err.message.includes('amount') 
    || err.message.includes('same wallet') || err.message.includes('greater than zero')) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};
