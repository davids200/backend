import { Injectable } from '@nestjs/common';
import { Client } from 'cassandra-driver';

@Injectable()
export class ScyllaSchemaLoader {
  async load(client: Client) {
    console.log('Loading Scylla schema...');

    // KEYSPACE
    await client.execute(`
      CREATE KEYSPACE IF NOT EXISTS social
      WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
    `);

    

    // FEED TABLE (timeline)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS social.feed (
  user_id UUID,
  created_at TIMESTAMP,
  post_id UUID,
  author_id UUID,
  location_id TEXT,
  PRIMARY KEY (user_id, created_at)
) WITH CLUSTERING ORDER BY (created_at DESC);
    `);

    // POSTS TABLE (denormalized)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS social.posts (
        post_id UUID PRIMARY KEY,
        user_id UUID,
        content TEXT,
        media LIST<TEXT>,
        location_id TEXT,
        created_at TIMESTAMP
      );
    `);


await client.execute(`
CREATE TABLE IF NOT EXISTS social.posts_by_location (
location_id TEXT,
created_at TIMESTAMP,
post_id UUID,
author_id UUID,
PRIMARY KEY (location_id, created_at, post_id)
) WITH CLUSTERING ORDER BY (created_at DESC);
);
`);



await client.execute(`
CREATE TABLE IF NOT EXISTS social.posts_by_country ( 
country_code TEXT,
created_at TIMESTAMP,
post_id TEXT,
author_id TEXT,
PRIMARY KEY (country_code, created_at, post_id)
) WITH CLUSTERING ORDER BY (created_at DESC);
`);
console.log('Scylla schema ready');
}





}