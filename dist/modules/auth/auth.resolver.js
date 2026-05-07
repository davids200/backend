"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const auth_service_1 = require("./auth.service");
const register_input_1 = require("./dto/register.input");
const login_input_1 = require("./dto/login.input");
const auth_response_model_1 = require("./models/auth-response.model");
const graphql_2 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("./guards/gql-auth.guard");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const user_model_1 = require("../user/models/user.model");
const refresh_token_input_1 = require("./dto/refresh-token.input");
const send_otp_input_1 = require("./dto/send-otp.input");
const verify_otp_input_1 = require("./dto/verify-otp.input");
const request_password_reset_input_1 = require("./dto/request-password-reset.input");
const reset_password_input_1 = require("./dto/reset-password.input");
const session_model_1 = require("./models/session.model");
const graphql_3 = require("@nestjs/graphql");
const device_service_1 = require("./device/device.service");
let AuthResolver = class AuthResolver {
    auth;
    device;
    constructor(auth, device) {
        this.auth = auth;
        this.device = device;
    }
    async sessions(user) {
        return this.auth.getSessions(user.id);
    }
    async me(user) {
        return this.auth.getMe(user.id);
    }
    async revokeSession(user, sessionId) {
        return this.auth.revokeSession(user.id, sessionId);
    }
    // REGISTER 
    async logout(user) {
        return this.auth.logout(user.sessionId);
    }
    async refreshToken(data) {
        return this.auth.refreshToken(data.refreshToken);
    }
    async register(data) {
        return this.auth.register(data);
    }
    async requestPasswordReset(data) {
        return this.auth.requestPasswordReset(data);
    }
    async resetPassword(data) {
        return this.auth.resetPassword(data);
    }
    // LOGIN 
    async login(data, context) {
        const deviceInfo = this.device.extract(context.req);
        return this.auth.login(data, deviceInfo);
    }
    async sendOtp(data) {
        return this.auth.sendOtp(data);
    }
    async verifyOtp(data) {
        return this.auth.verifyOtp(data);
    }
};
exports.AuthResolver = AuthResolver;
__decorate([
    (0, graphql_2.Query)(() => [session_model_1.SessionModel]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "sessions", null);
__decorate([
    (0, graphql_2.Query)(() => user_model_1.UserModel),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "me", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "revokeSession", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "logout", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_response_model_1.AuthResponse),
    __param(0, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_input_1.RefreshTokenInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "refreshToken", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_response_model_1.AuthResponse),
    __param(0, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_input_1.RegisterInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "register", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_password_reset_input_1.RequestPasswordResetInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "requestPasswordReset", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_input_1.ResetPasswordInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "resetPassword", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_response_model_1.AuthResponse),
    __param(0, (0, graphql_1.Args)('data')),
    __param(1, (0, graphql_3.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_input_1.LoginInput, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "login", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_otp_input_1.SendOtpInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "sendOtp", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_otp_input_1.VerifyOtpInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "verifyOtp", null);
exports.AuthResolver = AuthResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        device_service_1.DeviceService])
], AuthResolver);
//# sourceMappingURL=auth.resolver.js.map