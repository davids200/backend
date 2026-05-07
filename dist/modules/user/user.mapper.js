"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
class UserMapper {
    static toDto(user) {
        return {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            bio: user.bio,
            locationId: user.locationId,
            isVerified: user.isVerified,
        };
    }
    static toDtoList(users) {
        return users.map(this.toDto);
    }
}
exports.UserMapper = UserMapper;
//# sourceMappingURL=user.mapper.js.map