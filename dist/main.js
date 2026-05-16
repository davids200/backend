"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const kafka_bootstrap_1 = require("./infrastructure/kafka/kafka.bootstrap");
// async function bootstrap() {
//   const app =    await NestFactory.create(AppModule,);
//   app.enableCors();
//   await app.listen(3000);
//   console.log('🚀 Server running on http://localhost:3000/graphql',
//   );
// }
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // ================================================
    // KAFKA TOPIC BOOTSTRAP
    // ================================================
    const kafkaBootstrap = app.get(kafka_bootstrap_1.KafkaBootstrapService);
    await kafkaBootstrap
        .bootstrapTopics();
    // ================================================
    // START APP
    // ================================================
    await app.listen(3000);
    console.log('🚀 Server running on http://localhost:3000/graphql');
}
bootstrap();
//# sourceMappingURL=main.js.map