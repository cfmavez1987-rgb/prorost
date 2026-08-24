import { pool } from './pool';
import fs from 'fs';
import path from 'path';

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  try {
    await pool.query(schema);
    console.log('Database schema initialized successfully');
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

init();
