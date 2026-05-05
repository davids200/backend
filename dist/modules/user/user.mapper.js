"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
class UserMapper {
    static toDto(user) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            location_id: user.locationId
        };
    }
    static toDtoList(users) {
        return users.map(this.toDto);
    }
}
exports.UserMapper = UserMapper;
//# sourceMappingURL=user.mapper.js.map