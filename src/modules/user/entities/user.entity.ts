// src/modules/user/user.entity.ts

import {  ObjectType,  Field,  ID,} from '@nestjs/graphql';
import {  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@ObjectType()
@Entity('users')
export class UserEntity
{
  // =====================================================
  // ID
  // =====================================================

  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // =====================================================
  // USERNAME
  // =====================================================

  @Field()
  @Index()
  @Column({
    unique: true,
  })
  username!: string;

  // =====================================================
  // DISPLAY NAME
  // =====================================================

  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
  })
  displayName?: string;

  // =====================================================
  // AVATAR
  // =====================================================

  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
    type: 'text',
  })
  avatar?: string;

  // =====================================================
  // COVER PHOTO
  // =====================================================

  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
    type: 'text',
  })
  coverPhoto?: string;

  // =====================================================
  // BIO
  // =====================================================

  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
    type: 'text',
  })
  bio?: string;

  // =====================================================
  // LOCATION
  // =====================================================

  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
  })
  locationId?: string;

  // =====================================================
  // COUNTRY
  // =====================================================

  @Field({
    nullable: true,
  })
  @Column({
    nullable: true,
  })
  countryId?: string;

  // =====================================================
  // VERIFIED
  // =====================================================

  @Field()
  @Column({
    default: false,
  })
  isVerified!: boolean;

  // =====================================================
  // CELEBRITY
  // =====================================================

  @Field()
  @Column({
    default: false,
  })
  isCelebrity!: boolean;

  // =====================================================
  // MINOR
  // =====================================================

  @Field()
  @Column({
    default: false,
  })
  isMinor!: boolean;

  // =====================================================
  // ACTIVE
  // =====================================================

  @Field()
  @Column({
    default: true,
  })
  isActive!: boolean;

  // =====================================================
  // ONBOARDING
  // =====================================================

  @Field()
  @Column({
    default: false,
  })
  onboardingCompleted!: boolean;

  // =====================================================
  // DATE OF BIRTH
  // =====================================================

  @Field({
    nullable: true,
  })
  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfBirth?: Date;

  // =====================================================
  // LAST SEEN
  // =====================================================

  @Field({
    nullable: true,
  })
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastSeenAt?: Date;

  // =====================================================
  // CREATED AT
  // =====================================================

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  // =====================================================
  // UPDATED AT
  // =====================================================

  @Field()
  @UpdateDateColumn()
  updatedAt!: Date;
}