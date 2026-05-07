import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class UserEntity {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({    unique: true,  })
  username!: string;

  @Column({ nullable: true,  })
  displayName?: string;

  @Column({    nullable: true,    type: 'text',  })
  avatar?: string;

  @Column({    nullable: true,    type: 'text',  })
  coverPhoto?: string;

  @Column({    nullable: true,    type: 'text',  })
  bio?: string;


  @Column({    nullable: true,  })
  locationId?: string;

  @Column({    nullable: true,  })
  countryId!: string;


  @Column({    default: false,  })
  isVerified!: boolean;

  @Column({    default: false,  })
  isCelebrity!: boolean;

  @Column({    default: false,  })
  isMinor!: boolean;

  @Column({    default: true,  })
  isActive!: boolean;

  @Column({    default: false,  })
  onboardingCompleted!: boolean;

  

  @Column({    type: 'date',    nullable: true,  })
  dateOfBirth?: Date;


  @Column({    type: 'timestamp',    nullable: true,  })
  lastSeenAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}