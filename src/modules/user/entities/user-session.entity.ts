import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user_sessions')
export class UserSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  refreshToken!: string;

  @Column({ nullable: true })
  device?: string;

  @Column({ nullable: true })
  ip?: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;
}