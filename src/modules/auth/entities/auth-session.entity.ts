import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('auth_sessions')
export class AuthSessionEntity {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

   @Column({  unique: true,})
sessionId!: string;

  @Column({    type: 'text',  })
  refreshTokenHash!: string;


  @Column({    nullable: true,  })
  device?: string;

  @Column({    nullable: true,  })
  ipAddress?: string;

 

  @Column({    default: false,  })
  revoked!: boolean;

 

  @CreateDateColumn()
  createdAt!: Date;
}