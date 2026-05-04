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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_profile_entity_1 = require("./entities/user-profile.entity");
const user_education_entity_1 = require("./entities/user-education.entity");
const user_session_entity_1 = require("./entities/user-session.entity");
let UserService = class UserService {
    userRepo;
    profileRepo;
    eduRepo;
    sessionRepo;
    constructor(userRepo, profileRepo, eduRepo, sessionRepo) {
        this.userRepo = userRepo;
        this.profileRepo = profileRepo;
        this.eduRepo = eduRepo;
        this.sessionRepo = sessionRepo;
    }
    // =========================
    // CREATE USER
    // =========================
    async createUser(data) {
        const user = this.userRepo.create(data);
        return this.userRepo.save(user);
    }
    // =========================
    // GET USER
    // =========================
    async getUser(id) {
        return this.userRepo.findOne({ where: { id } });
    }
    // =========================
    // BULK USERS (SCALING)
    // =========================
    async getUsersByIds(ids) {
        return this.userRepo.find({
            where: { id: (0, typeorm_2.In)(ids) },
        });
    }
    // =========================
    // PROFILE
    // =========================
    async updateProfile(userId, data) {
        let profile = await this.profileRepo.findOne({ where: { userId } });
        if (!profile) {
            profile = this.profileRepo.create({ userId, ...data });
        }
        else {
            Object.assign(profile, data);
        }
        return this.profileRepo.save(profile);
    }
    async getProfile(userId) {
        return this.profileRepo.findOne({ where: { userId } });
    }
    // =========================
    // EDUCATION
    // =========================
    async addEducation(userId, data) {
        const edu = this.eduRepo.create({ userId, ...data });
        return this.eduRepo.save(edu);
    }
    async getEducation(userId) {
        return this.eduRepo.find({ where: { userId } });
    }
    // =========================
    // SESSION
    // =========================
    async createSession(data) {
        return this.sessionRepo.save(this.sessionRepo.create(data));
    }
    async deleteSession(token) {
        return this.sessionRepo.delete({ refreshToken: token });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_profile_entity_1.UserProfileEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(user_education_entity_1.UserEducationEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(user_session_entity_1.UserSessionEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map