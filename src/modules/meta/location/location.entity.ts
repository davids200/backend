import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('locations')
export class LocationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  name!: string;

  @Column()
  countryId!: string;
}