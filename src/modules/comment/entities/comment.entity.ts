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

  // =========================
  // POST RELATION (IMPORTANT)
  // =========================
  @Index()
  @Column()
  postId!: string;

  // =========================
  // USER
  // =========================
  @Index()
  @Column()
  userId!: string;

  // =========================
  // CONTENT
  // =========================
  @Column('text')
  content!: string;

  // =========================
  // THREADING
  // =========================
  @Index()
  @Column({ nullable: true })
  parentId?: string | null;   // ✅ FIXED

  @Index()
  @Column({ nullable: true })
  rootId?: string | null;     // ✅ FIXED

  // =========================
  // TIMESTAMP
  // =========================
  @Index()
  @CreateDateColumn()
  createdAt!: Date;
}