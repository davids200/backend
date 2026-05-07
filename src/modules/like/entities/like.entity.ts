import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('likes')

@Unique([
  'userId',
  'targetId',
  'targetType',
])

export class LikeEntity {

  @PrimaryGeneratedColumn('uuid')
  id!: string; 

  @Index()
  @Column()
  userId!: string;
 
  @Index()
  @Column()
  targetId!: string;
 

  @Index()
  @Column({type: 'enum', enum: ['post','comment',],})
  targetType!:'post' | 'comment';

  @CreateDateColumn()
  createdAt!: Date;
}