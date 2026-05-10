"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScyllaModule = void 0;
const common_1 = require("@nestjs/common");
const scylla_service_1 = require("./scylla.service");
const schema_loader_1 = require("./schema.loader");
const location_feed_repo_1 = require("./location.feed.repo");
let ScyllaModule = class ScyllaModule {
};
exports.ScyllaModule = ScyllaModule;
exports.ScyllaModule = ScyllaModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            scylla_service_1.ScyllaService,
            schema_loader_1.ScyllaSchemaLoader,
            location_feed_repo_1.LocationFeedRepository
        ],
        exports: [
            scylla_service_1.ScyllaService,
            location_feed_repo_1.LocationFeedRepository
        ],
    })
], ScyllaModule);
//# sourceMappingURL=scylla.module.js.map