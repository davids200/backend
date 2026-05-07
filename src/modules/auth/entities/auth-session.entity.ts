import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('auth_sessions')
export class AuthSessionEntity {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // =====================================================
  // SESSION
  // =====================================================

  @Column({unique: true,})
  sessionId!: string;

  @Column()
  userId!: string;

  @Column({type: 'text',})
  refreshTokenHash!: string;


  @Column({nullable: true,})
  deviceName?: string;

  @Column({nullable: true,  })
  platform?: string;

  @Column({nullable: true,})
  browser?: string;

  @Column({nullable: true,})
  ipAddress?: string;

  @Column({nullable: true,})
  country?: string;

  @Column({nullable: true, })
  city?: string;

  @Column({default: false,})
  revoked!: boolean;

  @Column({default: false,})
  suspicious!: boolean;

  @Column({type: 'timestamp',nullable: true,})
  lastActiveAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}