const { Pool } = require("pg");
require("dotenv").config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    require: true,
  },
});

const isConnected = async() => {
    try {
        const client = await pool.connect();
        console.log('Connected to the database');
        client.release();
    } catch (error) {
        console.error('Error connecting to the database', error);
    }
}

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});


module.exports = {pool, isConnected};