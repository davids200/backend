import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MinioService } from '../../infrastructure/minio/minio.service';
import { PostgresService } from '../../infrastructure/postgresql/postgres.service';
import { PostEntity } from './post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { extractHashtags } from '../hashtag/utils/extract-hashtags.util';
import { PostProducer } from './post.producer';

@Injectable()
export class PostService {
  constructor(
    private readonly minio: MinioService,
    private readonly postProducer: PostProducer,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    private readonly postgres: PostgresService,
  ) {}

  
  // CREATE POST
  async createPost(
    userId: string,
    data: CreatePostInput,
  ) {
    const post = await this.postRepo.save({
      ...data,
      userId,
    });

     



    // EXTRACT HASHTAGS 
    const hashtags = extractHashtags(
      data.content || '',
    );

    
// EMIT POST CREATED EVENT
await this.postProducer.postCreated({
postId: post.id,userId,
locationId: post.locationId,
createdAt: post.createdAt,
});

// EMIT HASHTAG EVENT
if (hashtags.length > 0) {

await this.postProducer.hashtagCreated({
postId: post.id,userId,hashtags,locationId: post.locationId,createdAt: post.createdAt,
});
}

return post;
}

  



// GET FOLLOWING 
async getFollowing(userId: string) {
const result =
await this.postgres.query(
`
SELECT  u.id,u.is_celebrity FROM follows f JOIN users u ON u.id = f.following_id
WHERE f.follower_id = $1
`,
[userId],
);
return result.rows;
}
 


// GET POSTS BY IDS
async getPostsByIds(
postIds: string[],
): Promise<PostEntity[]> {

if (!postIds.length) {
return [];
}
return this.postRepo.find({
where: {
id: In(postIds),
},
});
}




}