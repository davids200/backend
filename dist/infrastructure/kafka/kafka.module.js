"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaModule = void 0;
const common_1 = require("@nestjs/common");
// =====================================================
// CORE
// =====================================================
const kafka_service_1 = require("./kafka.service");
// =====================================================
// PRODUCERS
// =====================================================
const post_producer_1 = require("../../modules/post/post.producer");
const follow_producer_1 = require("../../modules/follow/follow.producer");
const notification_producer_1 = require("../../modules/notification/notification.producer");
const location_producer_1 = require("../../modules/location/location.producer");
const kafka_bootstrap_1 = require("./kafka.bootstrap");
let KafkaModule = class KafkaModule {
};
exports.KafkaModule = KafkaModule;
exports.KafkaModule = KafkaModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            // ================================================
            // CORE
            // ================================================
            kafka_service_1.KafkaService,
            kafka_bootstrap_1.KafkaBootstrapService,
            // ================================================
            // PRODUCERS
            // ================================================
            post_producer_1.PostProducer,
            follow_producer_1.FollowProducer,
            notification_producer_1.NotificationProducer,
            location_producer_1.LocationProducer,
        ],
        exports: [
            kafka_bootstrap_1.KafkaBootstrapService,
            kafka_service_1.KafkaService,
            // ================================================
            // PRODUCERS
            // ================================================
            post_producer_1.PostProducer,
            follow_producer_1.FollowProducer,
            notification_producer_1.NotificationProducer,
            location_producer_1.LocationProducer,
        ],
    })
], KafkaModule);
//# sourceMappingURL=kafka.module.js.map