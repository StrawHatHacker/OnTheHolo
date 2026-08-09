import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '$env/dynamic/private';

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB_NAME } = env;

export const db = drizzle({
	connection: {
		connectionString: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB_NAME}`,
	},
});
