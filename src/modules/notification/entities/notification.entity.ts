import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('notifications')
export class NotificationEntity {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  userId!: string;


  @Index()
  @Column({nullable: true,})
  actorId?: string;


  @Index()
  @Column()
  type!: string;

  @Column({nullable: true,})
  referenceId?: string;


  @Column({default: false,})
  read!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}