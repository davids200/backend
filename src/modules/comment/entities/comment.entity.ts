import { ObjectType } from '@nestjs/graphql';
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
@Column({
  type:'uuid',
  nullable:true,
})
parentId!:string | null;

@Index()
@Column({
  type:'uuid',
  nullable:true,
})
rootId!:string | null;

  // =========================
  // TIMESTAMP
  // =========================
  @Index()
  @CreateDateColumn()
  createdAt!: Date;
}