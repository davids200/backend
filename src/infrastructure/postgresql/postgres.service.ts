import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class PostgresService implements OnModuleDestroy {
  private client!: Client;

  async init() {
    this.client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'admin',
      password: 'admin',
      database: 'social_app',
    });

    await this.client.connect();
    console.log('Postgres connected');

    await this.createSchema();
  }

  async createSchema() {
    await this.client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        location_id TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
  }

  getClient(): Client {
    return this.client;
  }

  async query(text: string, params?: any[]) {
    return this.client.query(text, params);
  }

  async onModuleDestroy() {
    await this.client.end();
  }
}