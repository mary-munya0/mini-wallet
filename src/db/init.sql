CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    balance DECIMAL(20, 8) DEFAULT 0.0 CHECK (balance >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('transfer', 'deposit', 'withdrawal');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    sender_wallet_id INTEGER,
    receiver_wallet_id INTEGER NOT NULL,
    amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
    type transaction_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sender_wallet_id) 
        REFERENCES wallets(id) 
        ON DELETE SET NULL,
        
    FOREIGN KEY (receiver_wallet_id) 
        REFERENCES wallets(id) 
        ON DELETE CASCADE,

    CONSTRAINT valid_transaction_participants CHECK (
        (
            type = 'deposit' 
            AND sender_wallet_id IS NULL 
            AND receiver_wallet_id IS NOT NULL
        )
        OR
        (
            type = 'withdrawal' 
            AND sender_wallet_id IS NOT NULL 
            AND receiver_wallet_id IS NULL
        )
        OR
        (
            type = 'transfer' 
            AND sender_wallet_id IS NOT NULL 
            AND receiver_wallet_id IS NOT NULL
        )
    )
);
