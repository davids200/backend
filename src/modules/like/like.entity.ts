import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

export type LikeTargetType = 'post' | 'comment';

@Entity('likes')
@Unique(['userId', 'targetId', 'targetType'])
export class LikeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  targetId!: string; // postId OR commentId

  @Column()
  targetType!: LikeTargetType;

  @CreateDateColumn()
  createdAt!: Date;
}