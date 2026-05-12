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
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_profile_entity_1 = require("./entities/user-profile.entity");
const user_education_entity_1 = require("./entities/user-education.entity");
const user_session_entity_1 = require("./entities/user-session.entity");
const location_producer_1 = require("../location/location.producer");
let UserService = UserService_1 = class UserService {
    userRepo;
    profileRepo;
    educationRepo;
    sessionRepo;
    locationProducer;
    logger = new common_1.Logger(UserService_1.name);
    constructor(userRepo, profileRepo, educationRepo, sessionRepo, locationProducer) {
        this.userRepo = userRepo;
        this.profileRepo = profileRepo;
        this.educationRepo = educationRepo;
        this.sessionRepo = sessionRepo;
        this.locationProducer = locationProducer;
    }
    // =====================================================
    // CREATE USER
    // =====================================================
    async createUser(data) {
        const user = this.userRepo.create(data);
        return this.userRepo.save(user);
    }
    // =====================================================
    // GET USER
    // =====================================================
    async getUser(id) {
        return this.userRepo.findOne({
            where: { id },
        });
    }
    // =====================================================
    // BULK USERS
    // =====================================================
    async getUsersByIds(ids) {
        if (!ids.length) {
            return [];
        }
        return this.userRepo.find({
            where: {
                id: (0, typeorm_2.In)(ids),
            },
        });
    }
    // =====================================================
    // UPDATE PROFILE
    // =====================================================
    async updateProfile(userId, data) {
        let profile = await this.profileRepo.findOne({
            where: { userId },
        });
        if (!profile) {
            profile =
                this.profileRepo.create({
                    userId,
                    ...data,
                });
        }
        else {
            Object.assign(profile, data);
        }
        return this.profileRepo.save(profile);
    }
    // =====================================================
    // GET PROFILE
    // =====================================================
    async getProfile(userId) {
        return this.profileRepo.findOne({
            where: { userId },
        });
    }
    // =====================================================
    // ADD EDUCATION
    // =====================================================
    async addEducation(userId, data) {
        const education = this.educationRepo.create({
            userId,
            ...data,
        });
        return this.educationRepo.save(education);
    }
    // =====================================================
    // GET EDUCATION
    // =====================================================
    async getEducation(userId) {
        return this.educationRepo.find({
            where: { userId },
        });
    }
    // =====================================================
    // CREATE SESSION
    // =====================================================
    async createSession(data) {
        const session = this.sessionRepo.create(data);
        return this.sessionRepo.save(session);
    }
    // =====================================================
    // DELETE SESSION
    // =====================================================
    async deleteSession(refreshToken) {
        return this.sessionRepo.delete({
            refreshToken,
        });
    }
    // =====================================================
    // UPDATE LOCATION
    // =====================================================
    async updateLocation(userId, newLocationId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const oldLocationId = user.locationId;
        // ================================================
        // UPDATE DATABASE
        // ================================================
        user.locationId =
            newLocationId;
        await this.userRepo.save(user);
        // ================================================
        // LOCATION INITIALIZED
        // ================================================
        if (!oldLocationId) {
            await this.locationProducer
                .locationInitialized({
                userId,
                newLocationId,
            });
            // this.logger.log(
            //   `Location initialized for ${userId}`,
            // );
            return user;
        }
        // ================================================
        // LOCATION UPDATED
        // ================================================
        if (oldLocationId !==
            newLocationId) {
            await this.locationProducer
                .locationUpdated({
                userId,
                oldLocationId,
                newLocationId,
            });
            this.logger.log(`Location updated for ${userId}`);
        }
        return user;
    }
    async findAll() {
        return this.userRepo.find({
            order: {
                createdAt: 'DESC',
            },
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_profile_entity_1.UserProfileEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(user_education_entity_1.UserEducationEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(user_session_entity_1.UserSessionEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        location_producer_1.LocationProducer])
], UserService);
//# sourceMappingURL=user.service.js.map