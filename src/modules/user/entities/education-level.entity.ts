import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('education_levels')
export class EducationLevelEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  order!: number;
}