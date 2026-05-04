import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string; // receiver

  @Column()
  actorId!: string; // who triggered it

  @Column()
  type!: string; // like, comment, follow

  @Column()
  targetId!: string; // post/comment/etc

  @Column({ default: false })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}