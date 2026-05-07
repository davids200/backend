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
const auth_producer_1 = require("./auth.producer");
const redis_auth_rate_limit_service_1 = require("../../infrastructure/redis/auth/redis.auth-rate-limit.service");
let AuthService = class AuthService {
    identityRepo;
    authRateLimit;
    sessionRepo;
    users;
    jwt;
    redisOtp;
    authProducer;
    constructor(identityRepo, authRateLimit, sessionRepo, users, jwt, redisOtp, authProducer) {
        this.identityRepo = identityRepo;
        this.authRateLimit = authRateLimit;
        this.sessionRepo = sessionRepo;
        this.users = users;
        this.jwt = jwt;
        this.redisOtp = redisOtp;
        this.authProducer = authProducer;
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
        // EMAIL IDENTITY
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
        // PHONE IDENTITY
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
    async login(data) {
        const attempts = await this.authRateLimit.getLoginAttempts(data.login);
        if (attempts >= 5) {
            throw new common_1.UnauthorizedException('Too many login attempts');
        }
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
        if (!identity || !identity.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const valid = await (0, verify_password_util_1.verifyPassword)(identity.passwordHash, data.password);
        if (!valid) {
            await this.authRateLimit.incrementLoginAttempts(data.login);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.authRateLimit.clearLoginAttempts(data.login);
        return this.generateTokens(identity.userId);
    }
    // =====================================================
    // GENERATE TOKENS
    // =====================================================
    async generateTokens(userId) {
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
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '30d',
        });
        // ================================================
        // HASH REFRESH TOKEN
        // ================================================
        const refreshTokenHash = await (0, hash_password_util_1.hashPassword)(refreshToken);
        // ================================================
        // STORE SESSION
        // ================================================
        await this.sessionRepo.save({
            sessionId,
            userId,
            refreshTokenHash,
            revoked: false,
        });
        // ================================================
        // FETCH USER
        // ================================================
        const user = await this.users.getUser(userId);
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
    // GET CURRENT USER
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
        // FIND SESSIONS
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
        const requests = await this.authRateLimit.getOtpRequests(data.value);
        if (requests >= Number(process.env.OTP_ATTEMPTS)) {
            throw new common_1.BadRequestException('Too many OTP requests');
        }
        await this.authRateLimit.incrementOtpRequests(data.value);
        // GENERATE OTP
        const otp = (0, generate_otp_util_1.generateOtp)();
        // STORE OTP
        await this.redisOtp.saveOtp({ type: data.type, value: data.value, otp, });
        // EMIT EVENT
        await this.authProducer.otpRequested({ type: data.type, value: data.value, });
        // TEMP LOG
        console.log(`OTP for ${data.value}: ${otp}`);
        return true;
    }
    // VERIFY OTP
    async verifyOtp(data) {
        const attempts = await this.redisOtp.getAttempts({ type: data.type, value: data.value, });
        if (attempts >= Number(process.env.MAXIMUM_LOGIN_ATTEMPT)) {
            throw new common_1.UnauthorizedException('Too many attempts');
        }
        // GET STORED OTP 
        const storedOtp = await this.redisOtp.getOtp({ type: data.type, value: data.value, });
        // INVALID OTP
        if (!storedOtp || storedOtp !== data.otp) {
            await this.redisOtp.incrementAttempts({ type: data.type, value: data.value, });
            throw new common_1.UnauthorizedException('Invalid OTP');
        }
        // FIND IDENTITY 
        const identity = await this.identityRepo.findOne({ where: [{ provider: data.type === 'email' ? auth_identity_entity_1.AuthProvider.EMAIL : auth_identity_entity_1.AuthProvider.PHONE,
                    providerUserId: data.value, },], });
        // MARK VERIFIED
        if (identity) {
            identity.isVerified = true;
            await this.identityRepo.save(identity);
        }
        // CLEANUP
        await this.redisOtp.deleteOtp({ type: data.type, value: data.value, });
        await this.redisOtp.clearAttempts({ type: data.type, value: data.value, });
        return true;
    }
    async requestPasswordReset(data) {
        // ================================================
        // CHECK USER EXISTS
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
        // SILENT FAIL
        // ================================================
        if (!identity) {
            return true;
        }
        // ================================================
        // REUSE OTP SYSTEM
        // ================================================
        await this.sendOtp({
            type: data.type,
            value: data.value,
        });
        return true;
    }
    async resetPassword(data) {
        // VERIFY OTP
        const storedOtp = await this.redisOtp.getOtp({ type: data.type, value: data.value, });
        if (!storedOtp || storedOtp !== data.otp) {
            throw new common_1.UnauthorizedException('Invalid OTP');
        }
        // FIND IDENTITY
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
        // HASH NEW PASSWORD
        identity.passwordHash = await (0, hash_password_util_1.hashPassword)(data.newPassword);
        await this.identityRepo.save(identity);
        // ================================================
        // DELETE OTP
        // ================================================
        await this.redisOtp.deleteOtp({ type: data.type, value: data.value, });
        // REVOKE OLD SESSIONS
        await this.sessionRepo.update({ userId: identity.userId, }, {
            revoked: true,
        });
        return true;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(auth_identity_entity_1.AuthIdentityEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(auth_session_entity_1.AuthSessionEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_auth_rate_limit_service_1.RedisAuthRateLimitService,
        typeorm_2.Repository,
        user_service_1.UserService,
        jwt_1.JwtService,
        redis_otp_service_1.RedisOtpService,
        auth_producer_1.AuthProducer])
], AuthService);
//# sourceMappingURL=auth.service.js.map