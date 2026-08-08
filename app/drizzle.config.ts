import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

export default defineConfig({
    schema: './src/lib/server/db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: { url: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5432/${process.env.POSTGRES_DB_NAME}` },
    verbose: true,
    strict: true
});