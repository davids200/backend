import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import {
  Client,
} from 'cassandra-driver';

import {
  FEED_TABLE,
} from './feed.schema';

@Injectable()
export class ScyllaService
  implements OnModuleInit
{
  private readonly logger =
    new Logger(
      ScyllaService.name,
    );

  private client!: Client;

  // =====================================================
  // MODULE INIT
  // =====================================================

  async onModuleInit() {

    // ================================================
    // CONNECT WITHOUT KEYSPACE
    // ================================================

    this.client =
      new Client({

        contactPoints: [
          '127.0.0.1',
        ],

        localDataCenter:
          'datacenter1',
      });

    await this.client.connect();

    // ================================================
    // CREATE KEYSPACE
    // ================================================

    await this.client.execute(`

      CREATE KEYSPACE IF NOT EXISTS social_app

      WITH replication = {

        'class': 'SimpleStrategy',

        'replication_factor': 1
      }

    `);

    this.logger.log(
      '✔ Keyspace ensured',
    );

    // ================================================
    // SWITCH KEYSPACE
    // ================================================

    this.client.keyspace =
      'social_app';

    // ================================================
    // MAIN FEED TABLE
    // ================================================

    await this.client.execute(
      FEED_TABLE,
    );

    this.logger.log(
      '✔ Feed table ensured',
    );

    // ================================================
    // LOCATION FEED TABLE
    // ================================================

    await this.client.execute(`

      CREATE TABLE IF NOT EXISTS posts_by_location (

        location_id text,

        created_at timestamp,

        post_id text,

        author_id text,

        PRIMARY KEY (
          location_id,
          created_at,
          post_id
        )

      ) WITH CLUSTERING ORDER BY (
        created_at DESC
      );

    `);

    this.logger.log(
      '✔ posts_by_location ensured',
    );

    // ================================================
    // READY
    // ================================================

    this.logger.log(
      '🚀 ScyllaDB schema initialized',
    );
  }

  // =====================================================
  // INSERT USER FEED
  // =====================================================

  async insertFeedFanout(
    data: {

      user_id: string;

      post_id: string;

      author_id: string;

      location_id?: string;
    },
  ) {

    const query = `

      INSERT INTO social_app.feed (

        user_id,

        created_at,

        post_id,

        author_id,

        location_id
      )

      VALUES (

        ?,

        toTimestamp(now()),

        ?,

        ?,

        ?
      )

    `;

    return this.client.execute(

      query,

      [

        data.user_id,

        data.post_id,

        data.author_id,

        data.location_id ?? null,
      ],
    );
  }

  // =====================================================
  // INSERT LOCATION FEED
  // =====================================================

  async insertLocationPost(
    data: {

      location_id: string;

      post_id: string;

      author_id: string;

      created_at: Date;
    },
  ) {

    const query = `

      INSERT INTO posts_by_location (

        location_id,

        created_at,

        post_id,

        author_id
      )

      VALUES (?, ?, ?, ?)

    `;

    return this.client.execute(

      query,

      [

        data.location_id,

        data.created_at,

        data.post_id,

        data.author_id,
      ],

      {
        prepare: true,
      },
    );
  }

  // =====================================================
  // GET USER FEED
  // =====================================================

  async getFeed(
    user_id: string,
    limit = 20,
  ) {

    const query = `

      SELECT *

      FROM social_app.feed

      WHERE user_id = ?

      LIMIT ?

    `;

    return this.client.execute(

      query,

      [

        user_id,

        limit,
      ],

      {
        prepare: true,
      },
    );
  }

  // =====================================================
  // PAGINATED FEED
  // =====================================================

  async getFeedPaginated(

    userId: string,

    limit = 20,

    cursor?: string,
  ) {

    let query = `

      SELECT *

      FROM social_app.feed

      WHERE user_id = ?

    `;

    const params: any[] = [
      userId,
    ];

    if (cursor) {

      query += `
        AND created_at < ?
      `;

      params.push(
        cursor,
      );
    }

    query += `
      ORDER BY created_at DESC
      LIMIT ?
    `;

    params.push(
      limit,
    );

    return this.client.execute(

      query,

      params,

      {
        prepare: true,
      },
    );
  }

  // =====================================================
  // GENERIC EXECUTE
  // =====================================================

  async execute(

    query: string,

    params: any[] = [],

    options = {},
  ) {

    return this.client.execute(

      query,

      params,

      {

        prepare: true,

        ...options,
      },
    );
  }
}