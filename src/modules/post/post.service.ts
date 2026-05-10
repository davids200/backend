import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  In,
  Repository,
} from 'typeorm';

import { PostEntity }
from './post.entity';

import { CreatePostInput }
from './dto/create-post.input';

import { PostProducer }
from './post.producer';
import { LocationService } from '../location/location.service';

@Injectable()
export class PostService {
constructor(
@InjectRepository(PostEntity,)
private readonly repo:Repository<PostEntity>,
private readonly producer: PostProducer,
private locationService: LocationService
) {}

  




// CREATE POST
async createPost(userId: string,input: CreatePostInput,) {   

// EXTRACT MENTIONS   
const mentions =input.content?.match(/@\w+/g,) || [];    
// EXTRACT HASHTAGS
const hashtags =input.content?.match(/#\w+/g,) || [];

//VALIDATE LOCATION ID
let validatedLocationId:string | undefined;
if (input.visibility === 'public') {  validatedLocationId = undefined;
} else {
  if (!input.locationId) {    throw new Error('locationId is required for non-public posts',);
  }

  const location =await this.locationService.findOne(input.locationId,);
  if (!location) {throw new Error('Invalid locationId',);
  }
  validatedLocationId =location.id;
}

// CREATE ENTITY
const post = this.repo.create({
authorId: userId,
content: input.content,
visibility: input.visibility || 'public',
locationId: validatedLocationId,
});

    
    // SAVE TO POSTGRES
    

    const saved =
      await this.repo.save(
        post,
      );

    
    // EMIT EVENT
    

    await this.producer.postCreated({

      postId:
        saved.id,

      authorId:
        saved.authorId,

      content:
        saved.content,

      visibility:
        saved.visibility,

      mentions,

      hashtags,

      mediaIds: [],

      createdAt:
        saved.createdAt.toISOString(),

      locationId:
        saved.locationId,
    });

    return saved;
  }

  
  // GET POST
  

  async getPostById(
    id: string,
  ) {

    const post =
      await this.repo.findOne({

        where: {
          id,
        },
      });

    if (!post) {

      throw new NotFoundException(
        'Post not found',
      );
    }

    return post;
  }

  
  // GET POSTS BY IDS
  

  async getPostsByIds(
    ids: string[],
  ) {

    if (!ids.length) {
      return [];
    }

    return this.repo.find({

      where: {
        id: In(ids),
      },
    });
  }

  
  // DELETE POST
  

  async deletePost(

    id: string,

    userId: string,
  ) {

    const post =
      await this.repo.findOne({

        where: {
          id,
        },
      });

    if (!post) {

      throw new NotFoundException(
        'Post not found',
      );
    }

    if (
      post.authorId !== userId
    ) {

      throw new Error(
        'Unauthorized',
      );
    }

    await this.repo.delete(
      id,
    );

   await this.producer.postRemoved({

  postId:
    post.id,

  authorId:
    post.authorId,

  removedAt:
    new Date().toISOString(),
});

    return true;
  }
}