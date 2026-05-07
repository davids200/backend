import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('follows')
export class FollowEntity {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ================================================
  // FOLLOWER
  // ================================================

  @Index()
  @Column()
  followerId!: string;

  // ================================================
  // FOLLOWING
  // ================================================

  @Index()
  @Column()
  followingId!: string;

  // ================================================
  // TIMESTAMP
  // ================================================

  @CreateDateColumn()
  createdAt!: Date;
}