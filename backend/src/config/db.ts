import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'guesthouse_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  dateStrings: true
});

// Test connection on launch
export async function testDbConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${process.env.DB_NAME || 'guesthouse_db'}`);
    connection.release();
    return true;
  } catch (error: any) {
    console.warn(`[Database] MySQL Connection Notice: ${error.message}`);
    console.warn(`[Database] Tip: Ensure MySQL Server is running on port ${process.env.DB_PORT || '3306'} and run 'npm run db:init' to initialize tables.`);
    return false;
  }
}
