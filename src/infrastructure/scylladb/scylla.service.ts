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
  implements OnModuleInit
{

  private readonly logger =
    new Logger(
      ScyllaService.name,
    );

  public client!: Client;

  // =====================================================
  // MODULE INIT
  // =====================================================

  async onModuleInit() {

    try {

      this.client =
        new Client({

          contactPoints: [
            '127.0.0.1',
          ],

          localDataCenter:
            'datacenter1',
        });

      await this.client.connect();

      this.logger.log(
        '✅ Scylla connected',
      );

    } catch (error) {

      this.logger.error(
        '❌ Scylla initialization failed',
      );

      throw error;
    }
  }

  // =====================================================
  // EXECUTE QUERY
  // =====================================================

  async execute(

    query: string,

    params: any[] = [],
  ) {

    return this.client.execute(

      query,

      params,

      {

        prepare: true,
      },
    );
  }
}