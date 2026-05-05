import { Injectable } from '@nestjs/common';
import { ScyllaService } from './scylla.service';

type Visibility =
  | 'LOCAL'
  | 'DISTRICT'
  | 'COUNTRY'
  | 'GLOBAL';

@Injectable()
export class LocationFeedRepository {
  constructor(private readonly scylla: ScyllaService) {}

  // =========================
  // MAIN ENTRY (SMART ROUTING)
  // =========================
  async insertPost(data: {
    locationId: string;
    districtId?: string;
    countryCode?: string;
    postId: string;
    authorId: string;
    createdAt: Date;
    visibility: Visibility;
  }) {
    const queries: Promise<any>[] = [];

    // =========================
    // 1. LOCAL (village level)
    // =========================
    if (data.visibility === 'LOCAL') {
      queries.push(
        this.insertByLocation(
          data.locationId,
          data,
        ),
      );
    }

    // =========================
    // 2. DISTRICT
    // =========================
    if (data.visibility === 'DISTRICT' && data.districtId) {
      queries.push(
        this.insertByLocation(
          data.districtId,
          data,
        ),
      );
    }

    // =========================
    // 3. COUNTRY
    // =========================
    if (data.visibility === 'COUNTRY' && data.countryCode) {
      queries.push(
        this.insertByCountry(data.countryCode, data),
      );
    }

    // =========================
    // 4. GLOBAL
    // =========================
    if (data.visibility === 'GLOBAL') {
      queries.push(this.insertGlobal(data));
    }

    await Promise.all(queries);
  }

  // =========================
  // LOCATION INSERT
  // =========================
  private async insertByLocation(
    locationId: string,
    data: any,
  ) {
    await this.scylla.execute(
      `INSERT INTO posts_by_location 
       (location_id, created_at, post_id, author_id, visibility)
       VALUES (?, ?, ?, ?, ?)`,
      [
        locationId,
        data.createdAt,
        data.postId,
        data.authorId,
        data.visibility,
      ],
    );
  }

  // =========================
  // COUNTRY INSERT
  // =========================
  private async insertByCountry(
    countryCode: string,
    data: any,
  ) {
    await this.scylla.execute(
      `INSERT INTO posts_by_country 
       (country_code, created_at, post_id, author_id)
       VALUES (?, ?, ?, ?)`,
      [
        countryCode,
        data.createdAt,
        data.postId,
        data.authorId,
      ],
    );
  }

  // =========================
  // GLOBAL INSERT
  // =========================
  private async insertGlobal(data: any) {
    await this.scylla.execute(
      `INSERT INTO posts_global 
       (bucket, created_at, post_id, author_id)
       VALUES (?, ?, ?, ?)`,
      [
        'global',
        data.createdAt,
        data.postId,
        data.authorId,
      ],
    );
  }

  // =========================
  // READ (LOCATION)
  // =========================
  async getLocationPosts(locationId: string, limit = 50) {
    const result = await this.scylla.execute(
      `SELECT * FROM posts_by_location 
       WHERE location_id = ? LIMIT ?`,
      [locationId, limit],
    );

    return result.rows;
  }

  // =========================
  // READ (GLOBAL)
  // =========================
  async getGlobalPosts(limit = 50) {
    const result = await this.scylla.execute(
      `SELECT * FROM posts_global 
       WHERE bucket = ? LIMIT ?`,
      ['global', limit],
    );

    return result.rows;
  }
}