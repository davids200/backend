 import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PostgresService {
  private pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'admin',
    password: 'admin',
    database: 'social_app',
  });

  async query(query: string, params?: any[]) {
    return this.pool.query(query, params);
  }

 
}


 