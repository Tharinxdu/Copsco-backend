const Pool = require('pg').Pool;
const dotenv = require('dotenv').config();

// Database configuration for RMV
const rmvPool = new Pool({
    user: process.env.RMV_USER,
    password: process.env.RMV_PASSWORD,
    host: 'localhost',
    port: process.env.RMV_PORT,
    database: process.env.RMV_NAME
});

// Database configuration for your main application
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

module.exports = {
    rmvPool: rmvPool,
    pool: pool
};
