import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { getClient } from '../config/db.js';

export const initializeDatabase = async () => {
  const client = await getClient();
  
  try {
    const sqlPath = path.join(process.cwd(), 'src/db/init.sql');
    const sqlFileContent = fs.readFileSync(sqlPath, 'utf8');
    
    const sqlCommands = sqlFileContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);

    console.log('Initializing database schema...');
    for (const command of sqlCommands) {
      await client.query(command);
    }
    console.log('Database schema ready.');

    const userCount = await client.query('SELECT count(*) FROM users');
    
    if (parseInt(userCount.rows[0].count) === 0) {
      console.log('Seeding initial test data...');
      
      const seedPassword = process.env.USER_PASSWORD_SEED || 'Test123!';
      const saltRounds = 10;
      const hashedPass = await bcrypt.hash(seedPassword, saltRounds);

      await client.query('TRUNCATE users, wallets, transactions RESTART IDENTITY CASCADE;');

      await client.query(`
        INSERT INTO users (username, email, password_hash) VALUES 
        ('alice', 'alice@example.com', $1), 
        ('bob', 'bob@example.com', $1);
      `, [hashedPass]);


      await client.query(`
        INSERT INTO wallets (user_id, balance) VALUES 
        (1, 1000.00), 
        (2, 500.00);
      `);
      
      console.log('Seeding complete.');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    client.release();
  }
};
