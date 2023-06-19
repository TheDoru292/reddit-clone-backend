const mysql = require('mysql2');
const config = require('../config');

const conn = mysql.createConnection(config.db);

conn.connect();

module.exports = conn;
