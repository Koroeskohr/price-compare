import postgres from 'postgres';
import { env } from '$env/dynamic/private';

let sql: postgres.Sql<{}>;
if (env.DATABASE_URL) {
  sql = postgres(env.DATABASE_URL, {
    database: env.DATABASE_NAME || 'pricecompare'
  });
} else {
  sql = postgres({
    host: env.POSTGRES_HOST,
    database: env.POSTGRES_DB,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD
  });
}

export { sql };
