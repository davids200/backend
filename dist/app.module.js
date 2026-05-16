"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const typeorm_1 = require("@nestjs/typeorm");
const apollo_1 = require("@nestjs/apollo");
const path_1 = require("path");
const post_module_1 = require("./modules/post/post.module");
const feed_module_1 = require("./modules/feed/feed.module");
const auth_module_1 = require("./modules/auth/auth.module");
const minio_module_1 = require("./infrastructure/minio/minio.module");
const meta_module_1 = require("./modules/meta/meta.module");
const country_module_1 = require("./modules/meta/country/country.module");
const location_module_1 = require("./modules/location/location.module");
const config_1 = require("@nestjs/config");
const bootstrap_service_1 = require("./bootstrap/bootstrap.service");
const kafka_module_1 = require("./infrastructure/kafka/kafka.module");
const notification_module_1 = require("./modules/notification/notification.module");
const follow_module_1 = require("./modules/follow/follow.module");
const like_module_1 = require("./modules/like/like.module");
const scylla_module_1 = require("./infrastructure/scylladb/scylla.module");
const workers_module_1 = require("./workers/workers.module");
const repost_module_1 = require("./modules/repost/repost.module");
const view_module_1 = require("./modules/view/view.module");
const comment_module_1 = require("./modules/comment/comment.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
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
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
                playground: true,
                sortSchema: true,
                context: ({ req }) => ({ req }),
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            workers_module_1.WorkersModule,
            post_module_1.PostModule,
            meta_module_1.MetaModule,
            feed_module_1.FeedModule,
            auth_module_1.AuthModule,
            minio_module_1.MinioModule,
            location_module_1.LocationModule,
            country_module_1.CountryModule,
            kafka_module_1.KafkaModule,
            scylla_module_1.ScyllaModule,
            follow_module_1.FollowModule,
            like_module_1.LikeModule,
            notification_module_1.NotificationModule,
            repost_module_1.RepostModule,
            view_module_1.ViewModule,
            comment_module_1.CommentModule,
        ],
        providers: [
            // DebugResolver,
            bootstrap_service_1.BootstrapService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map