import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { UserEntity }
from '../../user/entities/user.entity';

export enum AuthProvider {
  EMAIL = 'email',
  PHONE = 'phone',
  GOOGLE = 'google',
  APPLE = 'apple',
}

@Entity('auth_identities')
@Index(
  ['provider', 'providerUserId'],
  { unique: true },
)
export class AuthIdentityEntity {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // =====================================================
  // USER
  // =====================================================

  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'userId',
  })
  user!: UserEntity;

  // =====================================================
  // PROVIDER
  // =====================================================

  @Column({    type: 'enum',    enum: AuthProvider,  })
  provider!: AuthProvider;

  @Column()
  providerUserId!: string;


  @Column({    nullable: true,  })
  email?: string;

  @Column({    nullable: true,  })
  phone?: string;

  @Column({    nullable: true,  })
  passwordHash?: string;

 
  @Column({    default: false,  })
  isVerified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}