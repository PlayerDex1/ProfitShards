import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

// Database schema
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  password: text("password").default(""), // Optional for OAuth users
  googleId: text("google_id").unique(),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const runs = pgTable("runs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  dungeonId: text("dungeon_id").notNull(),
  tokensFarmed: integer("tokens_farmed").notNull(),
  tokensAccelerated: integer("tokens_accelerated").notNull(),
  netTokens: integer("net_tokens").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export interface RunRecord {
  id: string;
  userId: string;
  dungeonId: string;
  tokensFarmed: number;
  tokensAccelerated: number;
  netTokens: number;
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  googleId?: string;
  emailVerified: boolean;
  createdAt: Date;
}

export interface CreateUserData {
  id: string;
  email: string;
  username: string;
  googleId?: string;
  emailVerified?: boolean;
  createdAt: number;
}

class Storage {
  async addRun(run: RunRecord): Promise<void> {
    await db.insert(runs).values({
      id: run.id,
      userId: run.userId,
      dungeonId: run.dungeonId,
      tokensFarmed: run.tokensFarmed,
      tokensAccelerated: run.tokensAccelerated,
      netTokens: run.netTokens,
      timestamp: new Date(run.timestamp),
    });
  }

  async listRuns(limit: number): Promise<RunRecord[]> {
    const results = await db.select().from(runs).limit(limit).orderBy(sql`timestamp DESC`);
    return results.map(row => ({
      id: row.id,
      userId: row.userId,
      dungeonId: row.dungeonId,
      tokensFarmed: row.tokensFarmed,
      tokensAccelerated: row.tokensAccelerated,
      netTokens: row.netTokens,
      timestamp: row.timestamp?.getTime() || Date.now(),
    }));
  }

  async listRunsByUser(userId: string, limit: number): Promise<RunRecord[]> {
    const results = await db.select()
      .from(runs)
      .where(sql`user_id = ${userId}`)
      .limit(limit)
      .orderBy(sql`timestamp DESC`);
    
    return results.map(row => ({
      id: row.id,
      userId: row.userId,
      dungeonId: row.dungeonId,
      tokensFarmed: row.tokensFarmed,
      tokensAccelerated: row.tokensAccelerated,
      netTokens: row.netTokens,
      timestamp: row.timestamp?.getTime() || Date.now(),
    }));
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const result = await db.insert(users).values({
      id: userData.id,
      email: userData.email,
      username: userData.username,
      googleId: userData.googleId,
      emailVerified: userData.emailVerified || false,
      createdAt: new Date(userData.createdAt),
    }).returning();

    const user = result[0];
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      googleId: user.googleId || undefined,
      emailVerified: user.emailVerified || false,
      createdAt: user.createdAt || new Date(),
    };
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await db.select()
      .from(users)
      .where(sql`id = ${id}`)
      .limit(1);

    if (result.length === 0) return null;

    const user = result[0];
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      googleId: user.googleId || undefined,
      emailVerified: user.emailVerified || false,
      createdAt: user.createdAt || new Date(),
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select()
      .from(users)
      .where(sql`email = ${email.toLowerCase()}`)
      .limit(1);

    if (result.length === 0) return null;

    const user = result[0];
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      googleId: user.googleId || undefined,
      emailVerified: user.emailVerified || false,
      createdAt: user.createdAt || new Date(),
    };
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    const result = await db.select()
      .from(users)
      .where(sql`google_id = ${googleId}`)
      .limit(1);

    if (result.length === 0) return null;

    const user = result[0];
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      googleId: user.googleId || undefined,
      emailVerified: user.emailVerified || false,
      createdAt: user.createdAt || new Date(),
    };
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<void> {
    await db.update(users)
      .set({ 
        googleId: googleId,
        emailVerified: true 
      })
      .where(sql`id = ${userId}`);
  }
}

export const storage = new Storage();
