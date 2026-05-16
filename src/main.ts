import 'reflect-metadata';
import {  NestFactory,} from '@nestjs/core';
import { AppModule } from './app.module';
import { KafkaBootstrapService } from './infrastructure/kafka/kafka.bootstrap';

// async function bootstrap() {

//   const app =    await NestFactory.create(AppModule,);
//   app.enableCors();
//   await app.listen(3000);

//   console.log('🚀 Server running on http://localhost:3000/graphql',
//   );
// }


async function bootstrap(){

  const app =
    await NestFactory.create(
      AppModule,
    );

  // ================================================
  // KAFKA TOPIC BOOTSTRAP
  // ================================================

  const kafkaBootstrap =
    app.get(
      KafkaBootstrapService,
    );

  await kafkaBootstrap
    .bootstrapTopics();

  // ================================================
  // START APP
  // ================================================

  await app.listen(3000);

  console.log(

    '🚀 Server running on http://localhost:3000/graphql',
  );
}
 
bootstrap();