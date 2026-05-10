import {

  Entity,

  PrimaryGeneratedColumn,

  Column,

  CreateDateColumn,

  UpdateDateColumn,

  Index,

} from 'typeorm';

@Entity('auth_sessions')

export class AuthSessionEntity {

  // ============================================
  // PRIMARY KEY
  // ============================================

  @PrimaryGeneratedColumn('uuid')

  id!: string;

  // ============================================
  // PUBLIC SESSION ID
  // ============================================

  @Index()

  @Column({
    unique: true,
  })

  sessionId!: string;

  // ============================================
  // USER
  // ============================================

  @Index()

  @Column()

  userId!: string;

  // ============================================
  // TOKENS
  // ============================================

  @Column()

  refreshTokenHash!: string;

  // ============================================
  // SECURITY
  // ============================================

  @Column({
    default: false,
  })

  suspicious!: boolean;

  @Column({
    default: false,
  })

  revoked!: boolean;

  @Column({
    default: false,
  })

  trusted!: boolean;

  // ============================================
  // DEVICE
  // ============================================

  @Column({
    nullable: true,
  })

  deviceName?: string;

  @Column({
    nullable: true,
  })

  browser?: string;

  @Column({
    nullable: true,
  })

  platform?: string;

  @Column({
    nullable: true,
  })

  deviceFingerprint?: string;

  // ============================================
  // NETWORK
  // ============================================

  @Column({
    nullable: true,
  })

  ipAddress?: string;

  @Column({
    nullable: true,
  })

  country?: string;

  @Column({
    nullable: true,
  })

  city?: string;

  // ============================================
  // ACTIVITY
  // ============================================

  @Column({
    nullable: true,
  })

  lastSeenAt?: Date;

  @Column({
    nullable: true,
  })

  revokedAt?: Date;

  // ============================================
  // TIMESTAMPS
  // ============================================

  @CreateDateColumn()

  createdAt!: Date;

  @UpdateDateColumn()

  updatedAt!: Date;
}