const { Pool } = require("pg");

// get connection string from env or use default
const connectionString = process.env.DATABASE_URL || 
  "postgresql://cyril:h9AKVgXQuHWf1PNYCoa2otbokDGdFJJH@dpg-d4o5g3vpm1nc73ft8ci0-a.oregon-postgres.render.com/collab_db_3cl9";

// check if its local or remote (render/aws/etc)
const isLocal = !connectionString.includes('render.com') && 
                !connectionString.includes('amazonaws.com') &&
                !connectionString.includes('azure.com') &&
                (connectionString.includes('localhost') || 
                 connectionString.includes('127.0.0.1') ||
                 connectionString.startsWith('postgresql://postgres:') ||
                 connectionString.startsWith('postgres://postgres:'));

// pool settings for better performance
const poolConfig = {
  connectionString: connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// only use ssl for remote connections
if (!isLocal) {
  poolConfig.ssl = {
    require: true,
    rejectUnauthorized: false
  };
}

const pool = new Pool(poolConfig);

// log what type of connection we're using
console.log(`Database connection: ${isLocal ? 'LOCAL' : 'REMOTE'}`);
if (isLocal) {
  console.log('Using local PostgreSQL (SSL disabled)');
} else {
  console.log('Using remote PostgreSQL (SSL enabled)');
}

// handle errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// test connection when server starts
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully');
  }
});

module.exports = pool;
