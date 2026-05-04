import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client } from 'cassandra-driver';
import { FEED_TABLE } from './feed.schema';

@Injectable()
export class ScyllaService implements OnModuleInit {
  private readonly logger = new Logger(ScyllaService.name);
  private client!: Client;

  async onModuleInit() {
    // ✅ STEP 1: connect WITHOUT keyspace
    this.client = new Client({
      contactPoints: ['127.0.0.1'],
      localDataCenter: 'datacenter1',
    });

    await this.client.connect();

    // ✅ STEP 2: ensure keyspace exists
    await this.client.execute(`
      CREATE KEYSPACE IF NOT EXISTS social_app
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
      }
    `);

    this.logger.log('✔ Keyspace ensured');

    // ✅ STEP 3: switch to keyspace
    this.client.keyspace = 'social_app';

    // ✅ STEP 4: ensure table exists
    await this.client.execute(FEED_TABLE);

    this.logger.log('✔ ScyllaDB connected and schema initialized');
  }

  async insertFeedFanout(data: {
    user_id: string;
    post_id: string;
    author_id: string;
    location_id?: string;
  }) {
    const query = `
      INSERT INTO social_app.feed
      (user_id, created_at, post_id, author_id, location_id)
      VALUES (?, toTimestamp(now()), ?, ?, ?)
    `;

    return this.client.execute(query, [
      data.user_id,
      data.post_id,
      data.author_id,
      data.location_id ?? null,
    ]);
  }





  async getFeed(user_id: string, limit = 20) {
    const query = `
      SELECT * FROM social_app.feed
      WHERE user_id = ?
      LIMIT ?
    `;

    return this.client.execute(query, [user_id, limit], {
      prepare: true,
    });
  }



  
async getFeedPaginated(userId: string, limit = 20, cursor?: string) {
  let query = `
    SELECT * FROM social.feed
    WHERE user_id = ?
  `;

  const params: any[] = [userId];

  if (cursor) {
    query += ` AND created_at < ?`;
    params.push(cursor);
  }

  query += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(limit);

  return this.client.execute(query, params, { prepare: true });
}

}