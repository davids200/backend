export const SOCIAL_SCHEMA = `

CREATE KEYSPACE IF NOT EXISTS social_app

WITH replication = {

  'class': 'SimpleStrategy',

  'replication_factor': 1
};
`;