import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  addRun(run: RunRecord): Promise<RunRecord>;
  listRuns(limit?: number): Promise<RunRecord[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private runs: RunRecord[];

  constructor() {
    this.users = new Map();
    this.runs = [];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async addRun(run: RunRecord): Promise<RunRecord> {
    this.runs.push(run);
    // cap to last 500 for memory safety
    if (this.runs.length > 500) {
      this.runs = this.runs.slice(-500);
    }
    return run;
  }

  async listRuns(limit: number = 20): Promise<RunRecord[]> {
    return this.runs.slice(-limit).reverse();
  }
}

export const storage = new MemStorage();

export interface RunRecord {
  id: string;
  userId: string;
  dungeonId: string;
  tokensFarmed: number;
  tokensAccelerated: number;
  netTokens: number;
  timestamp: number; // ms since epoch
}
