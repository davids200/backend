import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from 'cassandra-driver';
import { setTimeout } from 'node:timers/promises';

@Injectable()
export class ScyllaService implements OnModuleInit {
  private readonly logger = new Logger(ScyllaService.name);
  public client!: Client;
  
  private isInitialized = false;
  private initializationPromise: Promise<void>;
  private resolveInit!: () => void;

  constructor() {
    this.initializationPromise = new Promise((resolve) => {
      this.resolveInit = resolve;
    });
  }

  async onModuleInit() {
    const contactPoints = ['127.0.0.1'];
    const localDataCenter = 'datacenter1';
    const keyspace = 'social_app';

    try {
      // STEP 1: Connect to the cluster without a specific keyspace
      const bootstrapClient = new Client({
        contactPoints,
        localDataCenter,
        socketOptions: { connectTimeout: 10000 }
      });

      await bootstrapClient.connect();
      this.logger.log('📡 Connected to Scylla cluster for bootstrap');

      // STEP 2: Create Keyspace if it doesn't exist
      // SimpleStrategy is fine for development/single-node. 
      // NetworkTopologyStrategy is recommended for production.
      const createKeyspaceQuery = `
        CREATE KEYSPACE IF NOT EXISTS ${keyspace}
        WITH replication = {
          'class': 'SimpleStrategy',
          'replication_factor': 1
        };
      `;

      await bootstrapClient.execute(createKeyspaceQuery);
      this.logger.log(`✅ Keyspace "${keyspace}" ensured`);

      // Cleanup bootstrap connection
      await bootstrapClient.shutdown();

      // STEP 3: Wait briefly for schema metadata to propagate across nodes
      await setTimeout(1000);

      // STEP 4: Initialize the "Real" client used by the app
      this.client = new Client({
        contactPoints,
        localDataCenter,
        keyspace,
      });

      await this.client.connect();
      this.isInitialized = true;
      this.resolveInit();
      
      this.logger.log(`🚀 Scylla client connected to keyspace: ${keyspace}`);
    } catch (error) {
      this.logger.error('❌ Scylla initialization failed');
      // In a real app, you might want to retry or exit the process here
      throw error;
    }
  }

  async waitReady() {
    return this.initializationPromise;
  }

  async execute(query: string, params: any[] = []) {
    if (!this.isInitialized) await this.waitReady();
    return this.client.execute(query, params, { prepare: true });
  }
}