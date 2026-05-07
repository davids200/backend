"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const argon2 = __importStar(require("argon2"));
const crypto_1 = require("crypto");
const auth_identity_entity_1 = require("./entities/auth-identity.entity");
const auth_session_entity_1 = require("./entities/auth-session.entity");
const user_service_1 = require("../user/user.service");
const hash_password_util_1 = require("./utils/hash-password.util");
const verify_password_util_1 = require("./utils/verify-password.util");
const generate_otp_util_1 = require("./utils/generate-otp.util");
const redis_otp_service_1 = require("../../infrastructure/redis/otp/redis.otp.service");
const redis_auth_rate_limit_service_1 = require("../../infrastructure/redis/auth/redis.auth-rate-limit.service");
const auth_producer_1 = require("./auth.producer");
const auth_security_service_1 = require("./security/auth-security.service");
const kafka_topics_constants_1 = require("../../common/constants/kafka-topics.constants");
const notification_producer_1 = require("../notification/notification.producer");
let AuthService = class AuthService {
    identityRepo;
    sessionRepo;
    notificationProducer;
    users;
    jwt;
    redisOtp;
    authRateLimit;
    authProducer;
    security;
    constructor(identityRepo, sessionRepo, notificationProducer, 
    // =====================================================
    // SERVICES
    // =====================================================
    users, jwt, redisOtp, authRateLimit, authProducer, security) {
        this.identityRepo = identityRepo;
        this.sessionRepo = sessionRepo;
        this.notificationProducer = notificationProducer;
        this.users = users;
        this.jwt = jwt;
        this.redisOtp = redisOtp;
        this.authRateLimit = authRateLimit;
        this.authProducer = authProducer;
        this.security = security;
    }
    // =====================================================
    // REGISTER
    // =====================================================
    async register(data) {
        // ================================================
        // REQUIRE LOGIN METHOD
        // ================================================
        if (!data.email &&
            !data.phone) {
            throw new common_1.BadRequestException('Email or phone required');
        }
        // ================================================
        // REQUIRE PASSWORD
        // ================================================
        if (!data.password) {
            throw new common_1.BadRequestException('Password required');
        }
        // ================================================
        // CHECK EMAIL
        // ================================================
        if (data.email) {
            const existing = await this.identityRepo.findOne({
                where: {
                    provider: auth_identity_entity_1.AuthProvider.EMAIL,
                    providerUserId: data.email,
                },
            });
            if (existing) {
                throw new common_1.BadRequestException('Email already exists');
            }
        }
        // ================================================
        // CHECK PHONE
        // ================================================
        if (data.phone) {
            const existing = await this.identityRepo.findOne({
                where: {
                    provider: auth_identity_entity_1.AuthProvider.PHONE,
                    providerUserId: data.phone,
                },
            });
            if (existing) {
                throw new common_1.BadRequestException('Phone already exists');
            }
        }
        // ================================================
        // CREATE USER
        // ================================================
        const user = await this.users.createUser({
            username: data.username,
            displayName: data.displayName ||
                data.username,
            onboardingCompleted: false,
        });
        // ================================================
        // HASH PASSWORD
        // ================================================
        const passwordHash = await (0, hash_password_util_1.hashPassword)(data.password);
        // ================================================
        // CREATE EMAIL IDENTITY
        // ================================================
        if (data.email) {
            await this.identityRepo.save({
                userId: user.id,
                provider: auth_identity_entity_1.AuthProvider.EMAIL,
                providerUserId: data.email,
                email: data.email,
                passwordHash,
                isVerified: false,
            });
        }
        // ================================================
        // CREATE PHONE IDENTITY
        // ================================================
        if (data.phone) {
            await this.identityRepo.save({
                userId: user.id,
                provider: auth_identity_entity_1.AuthProvider.PHONE,
                providerUserId: data.phone,
                phone: data.phone,
                passwordHash,
                isVerified: false,
            });
        }
        // ================================================
        // AUTO LOGIN
        // ================================================
        return this.generateTokens(user.id);
    }
    // =====================================================
    // LOGIN
    // =====================================================
    async login(data, deviceInfo) {
        // ================================================
        // RATE LIMIT
        // ================================================
        const attempts = await this.authRateLimit
            .getLoginAttempts(data.login);
        if (attempts >= 5) {
            throw new common_1.UnauthorizedException('Too many login attempts');
        }
        // ================================================
        // FIND IDENTITY
        // ================================================
        const identity = await this.identityRepo.findOne({
            where: [
                {
                    provider: auth_identity_entity_1.AuthProvider.EMAIL,
                    providerUserId: data.login,
                },
                {
                    provider: auth_identity_entity_1.AuthProvider.PHONE,
                    providerUserId: data.login,
                },
            ],
        });
        if (!identity ||
            !identity.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        // ================================================
        // VERIFY PASSWORD
        // ================================================
        const valid = await (0, verify_password_util_1.verifyPassword)(identity.passwordHash, data.password);
        if (!valid) {
            await this.authRateLimit
                .incrementLoginAttempts(data.login);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        // ================================================
        // CLEAR RATE LIMIT
        // ================================================
        await this.authRateLimit
            .clearLoginAttempts(data.login);
        // ================================================
        // ISSUE TOKENS
        // ================================================
        return this.generateTokens(identity.userId, deviceInfo);
    }
    // GENERATE TOKENS
    // =====================================================
    async generateTokens(userId, deviceInfo) {
        // ================================================
        // SESSION
        // ================================================
        const sessionId = (0, crypto_1.randomUUID)();
        // ================================================
        // ACCESS TOKEN
        // ================================================
        const accessToken = await this.jwt.signAsync({
            sub: userId,
            sessionId,
        });
        // ================================================
        // REFRESH TOKEN
        // ================================================
        const refreshToken = await this.jwt.signAsync({
            sub: userId,
            sessionId,
        }, {
            secret: process.env
                .JWT_REFRESH_SECRET,
            expiresIn: '30d',
        });
        // ================================================
        // HASH REFRESH TOKEN
        // ================================================
        const refreshTokenHash = await (0, hash_password_util_1.hashPassword)(refreshToken);
        // ================================================
        // LOAD PREVIOUS SESSIONS
        // ================================================
        const previousSessions = await this.sessionRepo.find({
            where: {
                userId,
            },
        });
        // SECURITY CHECK
        const suspicious = this.security.isSuspicious({
            currentCountry: deviceInfo?.country,
            currentBrowser: deviceInfo?.browser,
            currentPlatform: deviceInfo?.platform,
            previousSessions,
        });
        // STORE SESSION 
        await this.sessionRepo.save({
            sessionId,
            userId,
            refreshTokenHash,
            suspicious,
            revoked: false,
            ipAddress: deviceInfo?.ipAddress,
            browser: deviceInfo?.browser,
            platform: deviceInfo?.platform,
            deviceName: deviceInfo?.deviceName,
        });
        // ================================================
        // EMIT SECURITY EVENT
        // ================================================
        if (suspicious) {
            await this.authProducer
                .suspiciousLogin({
                userId,
                sessionId,
            });
        }
        // ================================================
        // LOAD USER
        // ================================================
        const user = await this.users.getUser(userId);
        // ================================================
        // RESPONSE
        // ================================================
        return {
            accessToken,
            refreshToken,
            user: {
                id: user?.id,
                username: user?.username,
                displayName: user?.displayName,
                avatar: user?.avatar,
                bio: user?.bio,
                locationId: user?.locationId,
                isVerified: user?.isVerified,
                onboardingCompleted: user?.onboardingCompleted,
            },
        };
    }
    // =====================================================
    // CURRENT USER
    // =====================================================
    async getMe(userId) {
        const user = await this.users.getUser(userId);
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            bio: user.bio,
            locationId: user.locationId,
            isVerified: user.isVerified,
            onboardingCompleted: user.onboardingCompleted,
        };
    }
    // =====================================================
    // REFRESH TOKEN
    // =====================================================
    async refreshToken(refreshToken) {
        // ================================================
        // VERIFY TOKEN
        // ================================================
        const payload = await this.jwt.verifyAsync(refreshToken, {
            secret: process.env
                .JWT_REFRESH_SECRET,
        });
        // ================================================
        // FIND ACTIVE SESSIONS
        // ================================================
        const sessions = await this.sessionRepo.find({
            where: {
                userId: payload.sub,
                revoked: false,
            },
        });
        // ================================================
        // FIND MATCHING SESSION
        // ================================================
        let validSession = null;
        for (const session of sessions) {
            const valid = await argon2.verify(session.refreshTokenHash, refreshToken);
            if (valid) {
                validSession =
                    session;
                break;
            }
        }
        if (!validSession) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        // ================================================
        // REVOKE OLD SESSION
        // ================================================
        validSession.revoked =
            true;
        await this.sessionRepo.save(validSession);
        // ================================================
        // ISSUE NEW TOKENS
        // ================================================
        return this.generateTokens(payload.sub);
    }
    // =====================================================
    // LOGOUT
    // =====================================================
    async logout(sessionId) {
        const session = await this.sessionRepo.findOne({
            where: {
                sessionId,
            },
        });
        if (!session) {
            return true;
        }
        session.revoked = true;
        await this.sessionRepo.save(session);
        return true;
    }
    // =====================================================
    // SEND OTP
    // =====================================================
    async sendOtp(data) {
        // ================================================
        // OTP RATE LIMIT
        // ================================================
        const requests = await this.authRateLimit
            .getOtpRequests(data.value);
        if (requests >=
            Number(process.env
                .OTP_ATTEMPTS)) {
            throw new common_1.BadRequestException('Too many OTP requests');
        }
        // ================================================
        // INCREMENT COUNTER
        // ================================================
        await this.authRateLimit
            .incrementOtpRequests(data.value);
        // ================================================
        // GENERATE OTP
        // ================================================
        const otp = (0, generate_otp_util_1.generateOtp)();
        // ================================================
        // STORE OTP
        // ================================================
        await this.redisOtp.saveOtp({
            type: data.type,
            value: data.value,
            otp,
        });
        // ================================================
        // EMIT EVENT
        // ================================================
        this.notificationProducer.emit(kafka_topics_constants_1.KAFKA_TOPICS.NOTIFICATION_OTP_REQUESTED, { type: data.type, value: data.value, });
        // ================================================
        // TEMP LOG
        // ================================================
        console.log(`OTP for ${data.value}: ${otp}`);
        return true;
    }
    // =====================================================
    // VERIFY OTP
    // =====================================================
    async verifyOtp(data) {
        // ================================================
        // CHECK ATTEMPTS
        // ================================================
        const attempts = await this.redisOtp
            .getAttempts({
            type: data.type,
            value: data.value,
        });
        if (attempts >=
            Number(process.env
                .MAXIMUM_LOGIN_ATTEMPT)) {
            throw new common_1.UnauthorizedException('Too many attempts');
        }
        // ================================================
        // GET STORED OTP
        // ================================================
        const storedOtp = await this.redisOtp.getOtp({
            type: data.type,
            value: data.value,
        });
        // ================================================
        // INVALID OTP
        // ================================================
        if (!storedOtp ||
            storedOtp !== data.otp) {
            await this.redisOtp
                .incrementAttempts({
                type: data.type,
                value: data.value,
            });
            throw new common_1.UnauthorizedException('Invalid OTP');
        }
        // ================================================
        // FIND IDENTITY
        // ================================================
        const identity = await this.identityRepo.findOne({
            where: [
                {
                    provider: data.type === 'email'
                        ? auth_identity_entity_1.AuthProvider.EMAIL
                        : auth_identity_entity_1.AuthProvider.PHONE,
                    providerUserId: data.value,
                },
            ],
        });
        // ================================================
        // MARK VERIFIED
        // ================================================
        if (identity) {
            identity.isVerified =
                true;
            await this.identityRepo.save(identity);
        }
        // ================================================
        // CLEANUP
        // ================================================
        await this.redisOtp.deleteOtp({
            type: data.type,
            value: data.value,
        });
        await this.redisOtp
            .clearAttempts({
            type: data.type,
            value: data.value,
        });
        return true;
    }
    // =====================================================
    // REQUEST PASSWORD RESET
    // =====================================================
    async requestPasswordReset(data) {
        const identity = await this.identityRepo.findOne({
            where: [
                {
                    provider: data.type === 'email'
                        ? auth_identity_entity_1.AuthProvider.EMAIL
                        : auth_identity_entity_1.AuthProvider.PHONE,
                    providerUserId: data.value,
                },
            ],
        });
        // silent fail
        if (!identity) {
            return true;
        }
        await this.sendOtp({
            type: data.type,
            value: data.value,
        });
        return true;
    }
    // =====================================================
    // RESET PASSWORD
    // =====================================================
    async resetPassword(data) {
        // ================================================
        // VERIFY OTP
        // ================================================
        const storedOtp = await this.redisOtp.getOtp({
            type: data.type,
            value: data.value,
        });
        if (!storedOtp ||
            storedOtp !== data.otp) {
            throw new common_1.UnauthorizedException('Invalid OTP');
        }
        // ================================================
        // FIND IDENTITY
        // ================================================
        const identity = await this.identityRepo.findOne({
            where: [
                {
                    provider: data.type === 'email'
                        ? auth_identity_entity_1.AuthProvider.EMAIL
                        : auth_identity_entity_1.AuthProvider.PHONE,
                    providerUserId: data.value,
                },
            ],
        });
        if (!identity) {
            throw new common_1.UnauthorizedException('Identity not found');
        }
        // ================================================
        // HASH PASSWORD
        // ================================================
        identity.passwordHash =
            await (0, hash_password_util_1.hashPassword)(data.newPassword);
        await this.identityRepo.save(identity);
        // ================================================
        // DELETE OTP
        // ================================================
        await this.redisOtp.deleteOtp({
            type: data.type,
            value: data.value,
        });
        // ================================================
        // REVOKE SESSIONS
        // ================================================
        await this.sessionRepo.update({
            userId: identity.userId,
        }, {
            revoked: true,
        });
        return true;
    }
    // =====================================================
    // GOOGLE LOGIN
    // =====================================================
    async loginWithGoogle(data) {
        // ================================================
        // FIND GOOGLE IDENTITY
        // ================================================
        let identity = await this.identityRepo.findOne({
            where: {
                provider: auth_identity_entity_1.AuthProvider.GOOGLE,
                providerUserId: data.providerUserId,
            },
        });
        // ================================================
        // EXISTING USER
        // ================================================
        if (identity) {
            return this.generateTokens(identity.userId);
        }
        // ================================================
        // CREATE USER
        // ================================================
        const username = `google_${Date.now()}`;
        const user = await this.users.createUser({
            username,
            displayName: data.displayName,
            avatar: data.avatar,
            isVerified: true,
            onboardingCompleted: false,
        });
        // ================================================
        // CREATE IDENTITY
        // ================================================
        identity =
            await this.identityRepo.save({
                userId: user.id,
                provider: auth_identity_entity_1.AuthProvider.GOOGLE,
                providerUserId: data.providerUserId,
                email: data.email,
                isVerified: true,
            });
        // ================================================
        // ISSUE TOKENS
        // ================================================
        return this.generateTokens(user.id);
    }
    // =====================================================
    // GET SESSIONS
    // =====================================================
    async getSessions(userId) {
        return this.sessionRepo.find({
            where: {
                userId,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }
    // =====================================================
    // REVOKE SESSION
    // =====================================================
    async revokeSession(userId, sessionId) {
        const session = await this.sessionRepo.findOne({
            where: {
                userId,
                sessionId,
            },
        });
        if (!session) {
            throw new common_1.UnauthorizedException('Session not found');
        }
        session.revoked = true;
        await this.sessionRepo.save(session);
        return true;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(auth_identity_entity_1.AuthIdentityEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(auth_session_entity_1.AuthSessionEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notification_producer_1.NotificationProducer,
        user_service_1.UserService,
        jwt_1.JwtService,
        redis_otp_service_1.RedisOtpService,
        redis_auth_rate_limit_service_1.RedisAuthRateLimitService,
        auth_producer_1.AuthProducer,
        auth_security_service_1.AuthSecurityService])
], AuthService);
//# sourceMappingURL=auth.service.js.map