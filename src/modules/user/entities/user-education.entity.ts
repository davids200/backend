import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('user_education')
export class UserEducationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @Column()
  schoolName!: string;

  @Column()
  educationLevelId!: string;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ default: false })
  isCurrent!: boolean;
}