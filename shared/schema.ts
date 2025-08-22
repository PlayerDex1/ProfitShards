import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  created_at: integer("created_at").notNull(),
  email_verified: integer("email_verified").default(0),
  google_sub: text("google_sub").unique(),
});

export const sessions = pgTable("sessions", {
  session_id: varchar("session_id").primaryKey(),
  user_id: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  created_at: integer("created_at").notNull(),
  expires_at: integer("expires_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
