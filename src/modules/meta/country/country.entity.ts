import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'; 
import { LocationEntity } from '../../location/location.entity';

@Entity('countries')
export class CountryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  code!: string; // e.g., "UG"

  // Add this to fix the underline error
  @OneToMany(() => LocationEntity, (location) => location.country)
  locations!: LocationEntity[];
}