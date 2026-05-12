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
@Entity('reposts')
export class RepostEntity
{
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Index()
  @Column()
  userId!: string;

  @Field()
  @Index()
  @Column()
  postId!: string;

  // OPTIONAL QUOTE
  @Field({
    nullable: true,
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  quote?: string;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;
}