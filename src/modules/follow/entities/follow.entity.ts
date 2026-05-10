import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

import {
  ObjectType,
  Field,
  ID,
} from '@nestjs/graphql';

@ObjectType()

@Entity('follows')

@Index(
  ['followerId', 'followingId'],
  { unique: true },
)

export class FollowEntity {

  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column()
  followerId!: string;

  @Field()
  @Column()
  followingId!: string;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;
}