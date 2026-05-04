import { UserEntity } from './entities/user.entity';
import { UserResponseDto } from './dto/user.response.dto';

export class UserMapper {
  static toDto(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }

  static toDtoList(users: UserEntity[]): UserResponseDto[] {
    return users.map(this.toDto);
  }
}