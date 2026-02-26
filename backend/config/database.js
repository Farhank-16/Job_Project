const mysql  = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool({
  host:     config.db.host,
  user:     config.db.user,
  password: config.db.password,
  database: config.db.database,
  port:     config.db.port,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0,
});

pool.getConnection()
  .then(conn => { console.log('✅ Database connected'); conn.release(); })
  .catch(err  => { console.error('❌ Database connection failed:', err.message); });

module.exports = pool;