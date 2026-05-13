import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import {
  ObjectType,
  Field,
  ID,
} from '@nestjs/graphql'; 
import { PostVisibility } from './enums/post-visibility.enum';

@ObjectType()

@Entity('posts')
export class PostEntity {

  // =====================================================
  // ID
  // =====================================================

  @Field(() => ID)

  @PrimaryGeneratedColumn('uuid')

  id!: string;

  // =====================================================
  // AUTHOR
  // =====================================================

  @Field()

  @Index()

  @Column()

  authorId!: string;

  // =====================================================
  // CONTENT
  // =====================================================

  @Field({    nullable: true,  })
  @Column({    type: 'text',    nullable: true,
  })
  content?: string;

  // =====================================================
  // MEDIA
  // =====================================================

  @Field(() => [String], {
    nullable: true,
  })

  @Column('text', {
    array: true,
    nullable: true,
  })

  media?: string[];

  // =====================================================
  // LOCATION
  // =====================================================

  @Field({ nullable: true,})
  @Index()
  @Column({ nullable: true,})
  locationId!: string;

  // =====================================================
  // CREATED
  // =====================================================

  @Field()

  @CreateDateColumn()

  createdAt!: Date;

  // =====================================================
  // UPDATED
  // =====================================================

  @Field()

  @UpdateDateColumn()

  updatedAt!: Date;

  // =====================================================
  // LIKES
  // =====================================================

  @Field()

  @Column({
    default: 0,
  })

  likes!: number;

  // =====================================================
  // VISIBILITY
  // =====================================================

@Field()
@Column({type: 'enum',enum: PostVisibility,default: PostVisibility.PUBLIC,})
visibility!: PostVisibility;

  // =====================================================
  // MENTIONS
  // =====================================================

  @Field(() => [String])

  @Column({
    type: 'text',
    array: true,
    default: [],
  })

  mentions!: string[];

  // =====================================================
  // MEDIA IDS
  // =====================================================

  @Field(() => [String])

  @Column({
    type: 'text',
    array: true,
    default: [],
  })

  mediaIds!: string[];

  // =====================================================
  // HASHTAGS
  // =====================================================

  @Field(() => [String])

  @Column({
    type: 'text',
    array: true,
    default: [],
  })

  hashtags!: string[];

  // =====================================================
  // COMMENTS
  // =====================================================

  @Field()

  @Column({
    default: 0,
  })

  comments!: number;
}