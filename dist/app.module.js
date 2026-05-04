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
const debug_resolver_1 = require("./debug/debug.resolver");
const post_module_1 = require("./modules/post/post.module");
const feed_module_1 = require("./modules/feed/feed.module");
const auth_module_1 = require("./modules/auth/auth.module");
const user_entity_1 = require("./modules/user/entities/user.entity");
const minio_module_1 = require("./infrastructure/minio/minio.module");
const notification_module_1 = require("./modules/notification/notification.module");
const meta_module_1 = require("./modules/meta/meta.module");
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
                entities: [user_entity_1.UserEntity],
                synchronize: true, // ⚠️ dev only
            }),
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
                playground: true,
                sortSchema: true,
                context: ({ req }) => ({ req }),
            }),
            notification_module_1.NotificationModule,
            post_module_1.PostModule,
            meta_module_1.MetaModule,
            feed_module_1.FeedModule,
            auth_module_1.AuthModule,
            minio_module_1.MinioModule
        ],
        providers: [debug_resolver_1.DebugResolver],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map