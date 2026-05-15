// src/modules/like/like.entity.ts

import {
  ObjectType,
  Field,
  registerEnumType,
} from '@nestjs/graphql';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

// =====================================================
// LIKE TARGET TYPE
// =====================================================

export enum LikeTargetType {

  POST = 'POST',

  COMMENT = 'COMMENT',

  REPOST = 'REPOST',
}

// =====================================================
// GRAPHQL ENUM
// =====================================================

registerEnumType(
  LikeTargetType,
  {
    name:'LikeTargetType',
  },
);

// =====================================================
// LIKE ENTITY
// =====================================================

@ObjectType()

@Entity('likes')

@Unique([
  'userId',
  'targetId',
  'targetType',
])

export class LikeEntity {

  @Field()

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ================================================
  // USER
  // ================================================

  @Field()

  @Column('uuid')
  userId!: string;

  // ================================================
  // TARGET
  // ================================================

  @Field()

  @Column('uuid')
  targetId!: string;

  // ================================================
  // TARGET TYPE
  // ================================================

  @Field(() => LikeTargetType)

  @Column({
    type:'enum',
    enum:LikeTargetType,
  })

  targetType!: LikeTargetType;

  // ================================================
  // CREATED AT
  // ================================================

  @Field()

  @CreateDateColumn()
  createdAt!: Date;
}