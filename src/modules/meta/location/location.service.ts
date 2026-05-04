import { Injectable } from '@nestjs/common'; 
import { PostgresService } from '../../../infrastructure/postgresql/postgres.service';

@Injectable()
export class LocationService {
  constructor(private postgres: PostgresService) {}

  async createLocation(data: {
    name: string;
    type: string;
    parentId?: string;
    countryCode?: string;
  }) {
    const result = await this.postgres.query(
      `INSERT INTO locations (name, type, parent_id, country_code)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name, data.type, data.parentId || null, data.countryCode || null],
    );

    return result.rows[0];
  }

  async getChildren(parentId: string) {
    const result = await this.postgres.query(
      `SELECT * FROM locations WHERE parent_id = $1`,
      [parentId],
    );

    return result.rows;
  }

  async getLocation(id: string) {
    const result = await this.postgres.query(
      `SELECT * FROM locations WHERE id = $1`,
      [id],
    );

    return result.rows[0];
  }

  async getLocationTree(id: string) {
    // simple recursive approach (can later optimize with CTE)
    const node = await this.getLocation(id);
    const children = await this.getChildren(id);

    return {
      ...node,
      children,
    };
  }

  

}