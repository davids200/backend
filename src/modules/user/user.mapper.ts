import { UserEntity }
from './entities/user.entity';

import { UserResponseDto }
from './dto/user.response.dto';

export class UserMapper {

  static toDto(
    user: UserEntity,
  ): UserResponseDto {

    return {

      id:
        user.id,

      username:
        user.username,

      displayName:
        user.displayName,

      avatar:
        user.avatar,

      bio:
        user.bio,

      locationId:
        user.locationId,

      isVerified:
        user.isVerified,
    };
  }

  static toDtoList(
    users: UserEntity[],
  ): UserResponseDto[] {

    return users.map(
      this.toDto,
    );
  }
}