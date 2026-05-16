import { ObjectType,Field,Int,Float } from '@nestjs/graphql';
import { Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,Index } from 'typeorm';

@ObjectType()
@Entity('views')
export class ViewEntity {

  @PrimaryGeneratedColumn('uuid')
  @Field()
  id!:string;

  @Column()
  @Index()
  @Field()
  userId!:string;

  @Column()
  @Index()
  @Field()
  postId!:string;

  @Column({
    default:0,
  })
  @Field(() => Int)
  dwellTimeMs!:number;

  @Column({
    default:0,
  })
  @Field(() => Int)
  totalWatchTimeMs!:number;

  @Column({
    type:'float',
    default:0,
  })
  @Field(() => Float)
  completionRate!:number;

  @Column({
    default:false,
  })
  @Field()
  meaningful!:boolean;

  @CreateDateColumn()
  @Field()
  createdAt!:Date;
}