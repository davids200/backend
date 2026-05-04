import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  postId!: string;

  @Index()
  @Column()
  userId!: string;

  // 🔥 THREADING
  @Index()
  @Column({ nullable: true })
  parentId?: string;

  // 🔥 ROOT THREAD (fast grouping)
  @Index()
  @Column()
  rootId!: string;

  @Column('text')
  content!: string;

  @Column({ default: false })
  isEdited!: boolean;

  @Column({ default: false })
  isDeleted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}