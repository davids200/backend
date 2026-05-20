import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import {
  Client,
} from 'cassandra-driver';

@Injectable()
export class ScyllaService
implements OnModuleInit {

  private readonly logger =
    new Logger(
      ScyllaService.name,
    );

  private client!:Client;

  // =====================================================
  // INIT
  // =====================================================

  async onModuleInit(){

    this.client =
      new Client({

        contactPoints:[
          '127.0.0.1',
        ],

        localDataCenter:
          'datacenter1',

        keyspace:
          'social_app',
      });

    await this.client.connect();

    this.logger.log(
      '✅ ScyllaDB connected',
    );
  }

  // =====================================================
  // EXECUTE
  // =====================================================

  async execute(

    query:string,

    params:any[] = [],

    options:any = {},
  ){

    return this.client.execute(

      query,

      params,

      options,
    );
  }

  // =====================================================
  // BATCH
  // =====================================================

  async batch(
    queries:any[],
  ){

    return this.client.batch(

      queries,

      {

        prepare:true,
      },
    );
  }

  // =====================================================
  // SHUTDOWN
  // =====================================================

  async shutdown(){

    await this.client.shutdown();

    this.logger.log(
      '🛑 ScyllaDB disconnected',
    );
  }
}