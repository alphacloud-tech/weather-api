/**
 * Converts all tables in the configured MySQL database to InnoDB.
 *
 * Why: MyISAM has a much lower max index key length (often 1000 bytes), which breaks Strapi's schema sync.
 *
 * Usage (PowerShell):
 *   node scripts/mysql-convert-to-innodb.js
 *
 * Env vars (same as Strapi):
 *   DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD
 */
const mysql = require('mysql2/promise');

async function main() {
  const host = process.env.DATABASE_HOST || '127.0.0.1';
  const port = Number(process.env.DATABASE_PORT || 3306);
  const database = process.env.DATABASE_NAME || 'weather_app_db';
  const user = process.env.DATABASE_USERNAME || 'root';
  const password = process.env.DATABASE_PASSWORD || '';

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    // Be explicit; makes output predictable
    charset: 'utf8mb4',
  });

  try {
    const [rows] = await conn.query(
      `
        SELECT table_name AS tableName, engine AS engine
        FROM information_schema.tables
        WHERE table_schema = ?
          AND table_type = 'BASE TABLE'
      `,
      [database]
    );

    for (const { tableName, engine } of rows) {
      if (!tableName) continue;
      if (String(engine || '').toUpperCase() === 'INNODB') continue;

      // ROW_FORMAT=DYNAMIC helps with large indexes if the server is old/misconfigured.
      const sql = `ALTER TABLE \`${tableName}\` ENGINE=InnoDB ROW_FORMAT=DYNAMIC`;
      process.stdout.write(`Converting ${tableName} (${engine || 'unknown'}) -> InnoDB... `);
      await conn.query(sql);
      process.stdout.write('OK\n');
    }

    process.stdout.write('Done.\n');
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

