import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('countries')
export class CountryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  code!: string;
}