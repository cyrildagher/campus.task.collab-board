const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://cyril:h9AKVgXQuHWf1PNYCoa2otbokDGdFJJH@dpg-d4o5g3vpm1nc73ft8ci0-a.oregon-postgres.render.com/collab_db_3cl9",
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

module.exports = pool;
