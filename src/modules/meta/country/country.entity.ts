import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('countries')
export class CountryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ unique: true })
  name!: string;

  @Index()
  @Column({ unique: true })
  code!: string;
}