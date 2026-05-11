import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { DebugResolver } from './debug/debug.resolver';
import { PostModule } from './modules/post/post.module';
import { FeedModule } from './modules/feed/feed.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserEntity } from './modules/user/entities/user.entity';
import { MinioModule } from './infrastructure/minio/minio.module';
import { MetaModule } from './modules/meta/meta.module'; 
import { CountryModule } from './modules/meta/country/country.module';
import { LocationModule } from './modules/location/location.module'; 
import { ConfigModule } from '@nestjs/config';  
import { BootstrapService } from './bootstrap/bootstrap.service';
import { KafkaModule } from './infrastructure/kafka/kafka.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FollowModule } from './modules/follow/follow.module';
import { LikeModule } from './modules/like/like.module';
import { SessionCacheService } from './modules/auth/services/session-cache.service';
import { ScyllaModule } from './infrastructure/scylladb/scylla.module';
import { WorkersModule } from './workers/workers.module';
 
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin',
      database: 'social_app',
      autoLoadEntities: true,
      // entities: [UserEntity],
      synchronize: true, // ⚠️ dev only
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      sortSchema: true,
      context: ({ req }) => ({ req }),
    }),
    
ConfigModule.forRoot({  //WITHOUT THIS,You cannot safely use:process.env.JWT_SECRET
isGlobal: true,
}),
WorkersModule,
    PostModule,
    MetaModule,
    FeedModule,
    AuthModule ,
    MinioModule, 
    LocationModule,
    CountryModule,
    KafkaModule,
    ScyllaModule,
    FollowModule,
    LikeModule,
    NotificationModule,
     
  ],
  providers: [
    // DebugResolver,
    BootstrapService, 
  ],
})


export class AppModule {}