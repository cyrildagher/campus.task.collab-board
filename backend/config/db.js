const { Pool } = require("pg");

// Get connection string from environment or use default
const connectionString = process.env.DATABASE_URL || 
  "postgresql://cyril:h9AKVgXQuHWf1PNYCoa2otbokDGdFJJH@dpg-d4o5g3vpm1nc73ft8ci0-a.oregon-postgres.render.com/collab_db_3cl9";

// Detect if it's a local database (localhost, 127.0.0.1, or no host means local)
const isLocal = !connectionString.includes('render.com') && 
                !connectionString.includes('amazonaws.com') &&
                !connectionString.includes('azure.com') &&
                (connectionString.includes('localhost') || 
                 connectionString.includes('127.0.0.1') ||
                 connectionString.startsWith('postgresql://postgres:') ||
                 connectionString.startsWith('postgres://postgres:'));

// Configure pool with optimized settings
const poolConfig = {
  connectionString: connectionString,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection cannot be established
};

// Only use SSL for remote connections (Render, AWS, etc.)
if (!isLocal) {
  poolConfig.ssl = {
    require: true,
    rejectUnauthorized: false
  };
}

const pool = new Pool(poolConfig);

// Log connection info
console.log(`Database connection: ${isLocal ? 'LOCAL' : 'REMOTE'}`);
if (isLocal) {
  console.log('Using local PostgreSQL (SSL disabled)');
} else {
  console.log('Using remote PostgreSQL (SSL enabled)');
}

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully');
  }
});

module.exports = pool;
