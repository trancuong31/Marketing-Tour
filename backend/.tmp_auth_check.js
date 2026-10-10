const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(process.cwd(), '.env') });
const DB_USER = process.env.DB_USER || 'root';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_NAME = process.env.DB_NAME || 'db_marketing_tour';
const mariadb = require('mariadb');

(async () => {
  const conn = await mariadb.createConnection({
    host: DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: DB_USER,
    password: process.env.DB_PASSWORD,
    database: DB_NAME,
  });

  const rows = await conn.query('SELECT USER() AS current_user, CURRENT_USER() AS current_auth_user, @@version AS version');
  const pluginRows = await conn.query('SELECT user, host, plugin FROM mysql.user WHERE user = ?', [DB_USER]);

  console.log(JSON.stringify({
    db_user: DB_USER,
    db_host: DB_HOST,
    db_name: DB_NAME,
    current_user: rows[0].current_user,
    current_auth_user: rows[0].current_auth_user,
    mariadb_version: rows[0].version,
    plugin_rows: pluginRows,
  }, null, 2));

  await conn.end();
})().catch((err) => {
  console.error(JSON.stringify({
    status: 'AUTH_CHECK_FAILED',
    code: err.code || err.name,
    message: err.message,
  }, null, 2));
  process.exit(1);
});
