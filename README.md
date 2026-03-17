# Mini Wallet API

A simple, secure backend service for managing wallet transactions, built with **Node.js (Express)**, **TypeScript**, and **PostgreSQL**.

## Features & Technical Highlights
- **Atomic Transactions**: Uses PostgreSQL `BEGIN/COMMIT/ROLLBACK` to ensure transfers are all-or-nothing.
- **Concurrency Protection**: Implements row-level locking (`FOR UPDATE`) to prevent race conditions like double-spending.
- **Global Error Handling**: Centralized middleware for consistent API error responses (400, 404, 500).
- **Security**: Password hashing using **bcryptjs** for user credentials.
- **Clean Architecture**: Organized into Controllers, Services, and Middleware layers for scalability.
- **Auto-Initialization**: Database schema and seed data are automatically generated on server start.

## Setup Instructions
1. **Clone the repository:**
   git clone https://github.com/mary-munya0/mini-wallet.git
   cd wallet_service
2. **Install dependencies:**
    pnpm install
3. **Configure Environment Variables:**
    Create a .env file in the root directory based on the following:
        DB_HOST=localhost
        DB_PORT=5432
        DB_USER=your_postgres_user
        DB_PASSWORD=your_postgres_password
        DB_DATABASE=mini_wallet
        USER_PASSWORD_SEED=your_secure_seed
4. **Initialize database:**
    Create a database on postgres eg:mini_wallet and update the DB_DATABASE in the .env file then run:
        pnpm run dev
    The database will automatically be seeded.


5. **Server URL**
The server will start on http://localhost:3000.

## API Endpoints

All endpoints use JSON request/response.

## Testing with REST Client

There's a `requests.http` file for easy testing. If you have the **REST Client extension** for VS Code, you can click **“Send Request”** directly inside that file.

The following scenarios are included in `requests.http`:

- Successful transfer between wallets  
- Insufficient funds for transfer  
- Negative transfer amount  
- Self-transfer prevention  
- Successful deposit  
- Deposit with negative amount  
- Deposit to a non-existing wallet  
- Successful withdrawal  
- Withdrawal with insufficient funds  
- Withdrawal with negative amount  
- Withdrawal from a non-existing wallet
