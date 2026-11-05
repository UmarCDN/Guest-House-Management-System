import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function initDatabase() {
  console.log('---------------------------------------------------------');
  console.log(' Serene Haven Guest House - MySQL Database Initializer  ');
  console.log('---------------------------------------------------------\n');

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'guesthouse_db';

  console.log(`[1/4] Connecting to MySQL server at ${host}:${port} as '${user}'...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });
    console.log('✓ Successfully connected to MySQL server.');
  } catch (err: any) {
    console.error(`\n✖ Connection Failed: ${err.message}`);
    console.error('\nPlease verify that:');
    console.error(' 1. MySQL Server is running (check Services or start MySQL)');
    console.error(' 2. Port and credentials in backend/.env match your MySQL setup:');
    console.error(`    DB_HOST=${host}`);
    console.error(`    DB_PORT=${port}`);
    console.error(`    DB_USER=${user}`);
    console.error(`    DB_PASSWORD=${password ? '******' : '(empty)'}\n`);
    process.exit(1);
  }

  try {
    console.log(`[2/4] Reading SQL schema and seed file...`);
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log(`✓ Loaded schema (${Math.round(sql.length / 1024)} KB)`);

    console.log(`[3/4] Executing schema DDL and seeding initial records...`);
    await connection.query(sql);
    console.log(`✓ Tables and initial seed data created successfully in database '${dbName}'!`);

    console.log(`[4/4] Verifying database records...`);
    await connection.changeUser({ database: dbName });
    
    const [rooms]: any = await connection.query('SELECT COUNT(*) as count FROM rooms');
    const [users]: any = await connection.query('SELECT COUNT(*) as count FROM users');
    const [bookings]: any = await connection.query('SELECT COUNT(*) as count FROM bookings');

    console.log(`\n=========================================================`);
    console.log(` Database Initialization Complete!`);
    console.log(` - Database: ${dbName}`);
    console.log(` - Users seeded: ${users[0]?.count}`);
    console.log(` - Rooms seeded: ${rooms[0]?.count}`);
    console.log(` - Bookings seeded: ${bookings[0]?.count}`);
    console.log(`=========================================================\n`);
    console.log(`You can now inspect and query the database in MySQL Workbench`);
    console.log(`or start the backend with: npm run dev\n`);
  } catch (err: any) {
    console.error(`\n✖ Database Initialization Error: ${err.message}`);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
