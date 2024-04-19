import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import { logger } from './logger';

let sql: postgres.Sql<{}>;
if (env.DATABASE_URL) {
  logger.info('Running production sql');
  sql = postgres(env.DATABASE_URL, {
    database: env.DATABASE_NAME || 'pricecompare'
  });
} else {
  logger.info('Running development sql');
  sql = postgres({
    host: env.POSTGRES_HOST,
    database: env.POSTGRES_DB,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
  });
}

(async function() {
  try {
    await sql`SELECT 1`;
    logger.info("Connected to postgres")
  } catch (err) {
    logger.error("Could not connect to Postgres")
  }
})()

export { sql };
