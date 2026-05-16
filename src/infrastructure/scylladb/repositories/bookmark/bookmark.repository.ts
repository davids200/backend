import {
  Injectable,
} from '@nestjs/common';

import {
  Repository,
} from 'typeorm';

import {
  InjectRepository,
} from '@nestjs/typeorm';
import { BookmarkEntity } from '../../../../modules/bookmark/entities/bookmark.entity';


@Injectable()
export class BookmarkRepository {

  constructor(
    @InjectRepository(BookmarkEntity,    )
    private readonly repo:Repository<BookmarkEntity>,
  ) {}

  async createBookmark(

    userId:string,

    postId:string,
  ){

    const bookmark =
      this.repo.create({

        userId,

        postId,
      });

    return this.repo.save(
      bookmark,
    );
  }

  async removeBookmark(

    userId:string,

    postId:string,
  ){

    return this.repo.delete({

      userId,

      postId,
    });
  }

  async findBookmark(

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
}