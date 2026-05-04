import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  authorId!: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column('text', { array: true, nullable: true })
  media?: string[];

  
  @Index()
  @Column()
  locationId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

   @Column({ default: 0 })
  likes!: number;

  @Column({ default: 0 })
  comments!: number;
}