export class UserResponseDto {

  id!: string;

  username!: string;

  displayName?: string;

  avatar?: string;

  bio?: string;

  locationId?: string;

  isVerified!: boolean;
}