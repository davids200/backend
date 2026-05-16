import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('bookmarks')
export class BookmarkEntity {

  @PrimaryGeneratedColumn('uuid')
  id!:string;

  // =====================================================
  // USER
  // =====================================================

  @Index()
  @Column({
    type:'uuid',
  })
  userId!:string;

  // =====================================================
  // POST
  // =====================================================

  @Index()
  @Column({
    type:'uuid',
  })
  postId!:string;

  // =====================================================
  // TIMESTAMP
  // =====================================================

  @CreateDateColumn()
  createdAt!:Date;
}