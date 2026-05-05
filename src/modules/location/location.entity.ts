import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  OneToMany, 
  JoinColumn, 
  Index,
  Unique,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { CountryEntity } from '../meta/country/country.entity';

@ObjectType()
@Entity('locations')
@Unique(['name', 'parentId', 'countryId']) // Prevents duplicate names within the same parent/country
export class LocationEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column()
  name!: string;

  @Field(() => Int)
  @Column({ type: 'int', default: 1 })
  level!: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  latitude!: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitude!: number;

  @Field()
  @Index()
  @Column({ name: 'country_id' })
  countryId!: string;

  @ManyToOne(() => CountryEntity, (country) => country.locations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'country_id' })
  country!: CountryEntity;

  @Field(() => String, { nullable: true })
  @Column({ name: 'parent_id', nullable: true })
  parentId!: string | null;

  @ManyToOne(() => LocationEntity, (location) => location.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent!: LocationEntity;

  @Field(() => [LocationEntity], { nullable: 'itemsAndList' })
  @OneToMany(() => LocationEntity, (location) => location.parent)
  children!: LocationEntity[];

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}