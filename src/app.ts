import express,{type Express} from 'express'
import { handleTransfer } from './controllers/wallet_controller.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateTransfer } from './middleware/validate.js';

const app: Express = express();

app.use(express.json())

app.post('/api/transfer', validateTransfer, handleTransfer)
app.use(errorHandler)

export default app