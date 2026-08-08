import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: text().notNull(),
    email: text().notNull().unique(),
    password: text().notNull(),
    salt: text().notNull(),
    status: integer().notNull(),
    priviledge_status: integer().notNull(),
    created_at: text().notNull(),
    updated_at: text().notNull()
});

export const sessionTable = pgTable("sessions", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer().notNull().references(() => usersTable.id),
    token: text().notNull(),
    created_at: text().notNull(),
});