"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_profile_entity_1 = require("./entities/user-profile.entity");
const user_education_entity_1 = require("./entities/user-education.entity");
const user_session_entity_1 = require("./entities/user-session.entity");
const user_service_1 = require("./user.service");
const user_resolver_1 = require("./user.resolver");
const kafka_module_1 = require("../../infrastructure/kafka/kafka.module");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.UserEntity,
                user_profile_entity_1.UserProfileEntity,
                user_education_entity_1.UserEducationEntity,
                user_session_entity_1.UserSessionEntity,
            ]),
            kafka_module_1.KafkaModule,
        ],
        providers: [user_service_1.UserService, user_resolver_1.UserResolver],
        exports: [user_service_1.UserService],
    })
], UserModule);
//# sourceMappingURL=user.module.js.map