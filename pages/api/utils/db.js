import { Pool } from 'pg';

// Debug environment variables
console.log('🔍 Database Configuration Debug:');
console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
console.log('DB_PORT:', process.env.DB_PORT || 'NOT SET');
console.log('DB_PASS exists:', !!process.env.DB_PASS);
console.log('DB_PASS length:', process.env.DB_PASS?.length || 0);

// Hardcoded database credentials (since .env is not loading)
const requiredEnvVars = {
  user: 'postgres',
  host: '34.93.195.0',
  database: 'postgres',
  password: 'Plotpointe!@3456',
  port: 5432
};

// Validate password is a string
if (typeof requiredEnvVars.password !== 'string') {
  console.error('❌ Password is not a string:', typeof requiredEnvVars.password);
  requiredEnvVars.password = String(requiredEnvVars.password || '');
}

console.log('✅ Final DB Config (password hidden):', {
  ...requiredEnvVars,
  password: '[HIDDEN]'
});

const pool = new Pool({
  ...requiredEnvVars,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

export default pool;

