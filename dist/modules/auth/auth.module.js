"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const auth_service_1 = require("./auth.service");
const auth_resolver_1 = require("./auth.resolver");
const auth_producer_1 = require("./auth.producer");
const auth_identity_entity_1 = require("./entities/auth-identity.entity");
const auth_session_entity_1 = require("./entities/auth-session.entity");
const user_module_1 = require("../user/user.module");
const redis_module_1 = require("../../infrastructure/redis/redis.module");
const kafka_module_1 = require("../../infrastructure/kafka/kafka.module");
const apple_strategy_1 = require("./strategies/apple.strategy");
const redis_otp_service_1 = require("../../infrastructure/redis/otp/redis.otp.service");
const redis_auth_rate_limit_service_1 = require("../../infrastructure/redis/auth/redis.auth-rate-limit.service");
const google_strategy_1 = require("./strategies/google.strategy");
//import { AuthController } from './auth.controller';
const auth_security_service_1 = require("./security/auth-security.service");
const device_service_1 = require("./device/device.service");
const sms_gateway_service_1 = require("../notification/channels/sms/sms-gateway.service");
const twilio_provider_1 = require("../notification/channels/sms/providers/twilio.provider");
const custom_sms_provider_1 = require("../notification/channels/sms/providers/custom-sms.provider");
const config_1 = require("@nestjs/config");
const session_cache_service_1 = require("./services/session-cache.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // DATABASE
            typeorm_1.TypeOrmModule.forFeature([
                auth_identity_entity_1.AuthIdentityEntity,
                auth_session_entity_1.AuthSessionEntity,
            ]),
            // JWT
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: '1d',
                    },
                }),
            }),
            // DEPENDENCIES
            user_module_1.UserModule,
            redis_module_1.RedisModule,
            kafka_module_1.KafkaModule,
        ],
        providers: [
            auth_service_1.AuthService,
            auth_resolver_1.AuthResolver,
            auth_producer_1.AuthProducer,
            apple_strategy_1.JwtStrategy,
            redis_otp_service_1.RedisOtpService,
            redis_auth_rate_limit_service_1.RedisAuthRateLimitService,
            google_strategy_1.GoogleStrategy,
            auth_security_service_1.AuthSecurityService,
            device_service_1.DeviceService,
            sms_gateway_service_1.SmsGatewayService,
            twilio_provider_1.TwilioProvider,
            custom_sms_provider_1.CustomSmsProvider,
            session_cache_service_1.SessionCacheService
        ],
        //   controllers: [
        //   AuthController,
        // ],
        exports: [
            auth_service_1.AuthService,
            session_cache_service_1.SessionCacheService
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map