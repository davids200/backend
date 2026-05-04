import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('user_profiles')
export class UserProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ default: false })
  isPrivate!: boolean;
}