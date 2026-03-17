import express,{type Express} from 'express'
import { handleDeposit, handleTransfer, handleWithdraw } from './controllers/wallet_controller.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateTransfer,validateDepositAndWithdrawal } from './middleware/validate.js';

const app: Express = express();

app.use(express.json())

app.post('/api/transfer', validateTransfer, handleTransfer)
app.post('/api/deposit', validateDepositAndWithdrawal, handleDeposit);
app.post('/api/withdraw', validateDepositAndWithdrawal, handleWithdraw)

app.use(errorHandler)

export default app