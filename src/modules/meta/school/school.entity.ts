import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('schools')
export class SchoolEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  locationId!: string;
}