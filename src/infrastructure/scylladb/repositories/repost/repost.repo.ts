import {
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';
import { RepostEntity } from '../../../../modules/repost/repost.entity';
 

@Injectable()
export class RepostRepository {

  constructor(

    @InjectRepository(
      RepostEntity,
    )

    private readonly repo:
      Repository<RepostEntity>,
  ) {}

  // =====================================================
  // CREATE
  // =====================================================

  async create(
    data:Partial<RepostEntity>,
  ){

    const repost =
      this.repo.create(
        data,
      );

    return this.repo.save(
      repost,
    );
  }

  // =====================================================
  // FIND BY ID
  // =====================================================

  async findById(
    id:string,
  ){

    return this.repo.findOne({

      where:{ id },
    });
  }

  // =====================================================
  // FIND BY USER + POST
  // =====================================================

  async findByUserAndPost(

    userId:string,

    postId:string,
  ){

    return this.repo.findOne({

      where:{

        userId,

        postId,
      },
    });
  }

  // =====================================================
  // REMOVE
  // =====================================================

  async remove(
    repost:RepostEntity,
  ){

    return this.repo.remove(
      repost,
    );
  }

  // =====================================================
  // EXISTS
  // =====================================================

  async exists(

    userId:string,

    postId:string,
  ){

    const repost =
      await this.repo.findOne({

        where:{

          userId,

          postId,
        },
      });

    return !!repost;
  }

  // =====================================================
  // GET USER REPOSTS
  // =====================================================

  async getUserReposts(

    userId:string,

    limit:number = 20,

    offset:number = 0,
  ){

    return this.repo.find({

      where:{
        userId,
      },

      order:{
        createdAt:'DESC',
      },

      take:limit,

      skip:offset,
    });
  }

  // =====================================================
  // GET POST REPOSTS
  // =====================================================

  async getPostReposts(

    postId:string,

    limit:number = 20,

    offset:number = 0,
  ){

    return this.repo.find({

      where:{
        postId,
      },

      order:{
        createdAt:'DESC',
      },

      take:limit,

      skip:offset,
    });
  }
}