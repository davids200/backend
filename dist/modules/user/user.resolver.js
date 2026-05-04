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
exports.UserResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const update_profile_input_1 = require("./dto/update-profile.input");
const add_education_input_1 = require("./dto/add-education.input");
const gql_auth_guard_1 = require("../auth/guards/gql-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const create_user_inputs_1 = require("./dto/create-user.inputs");
let UserResolver = class UserResolver {
    service;
    constructor(service) {
        this.service = service;
    }
    // =========================
    // CREATE
    // =========================
    async createUser(data) {
        return this.service.createUser({
            ...data,
            dateOfBirth: data.dateOfBirth
                ? new Date(data.dateOfBirth)
                : undefined,
        });
    }
    // =========================
    // GET USER
    // =========================
    getUser(id) {
        return this.service.getUser(id);
    }
    // =========================
    // PROFILE
    // =========================
    updateProfile(user, data) {
        return this.service.updateProfile(user.id, data);
    }
    getProfile(user) {
        return this.service.getProfile(user.id);
    }
    // =========================
    // EDUCATION
    // =========================
    addEducation(user, data) {
        return this.service.addEducation(user.id, {
            ...data,
            startDate: data.startDate
                ? new Date(data.startDate)
                : undefined,
            endDate: data.endDate
                ? new Date(data.endDate)
                : undefined,
        });
    }
    getEducation(user) {
        return this.service.getEducation(user.id);
    }
};
exports.UserResolver = UserResolver;
__decorate([
    (0, graphql_1.Mutation)(() => String),
    __param(0, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_inputs_1.CreateUserInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "createUser", null);
__decorate([
    (0, graphql_1.Query)(() => String),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "getUser", null);
__decorate([
    (0, graphql_1.Mutation)(() => String),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_input_1.UpdateProfileInput]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "updateProfile", null);
__decorate([
    (0, graphql_1.Query)(() => String),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "getProfile", null);
__decorate([
    (0, graphql_1.Mutation)(() => String),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_education_input_1.AddEducationInput]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "addEducation", null);
__decorate([
    (0, graphql_1.Query)(() => String),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "getEducation", null);
exports.UserResolver = UserResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserResolver);
//# sourceMappingURL=user.resolver.js.map