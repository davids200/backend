import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MinioService } from '../../infrastructure/minio/minio.service';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { In, Repository } from 'typeorm';
import { PostEntity } from './post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { InjectRepository } from '@nestjs/typeorm';
import { PostgresService } from '../../infrastructure/postgresql/postgres.service';

@Injectable()
export class PostService {
  postRepository: any; 
  constructor(
    private minio: MinioService,
    private kafka: KafkaService,
    @InjectRepository(PostEntity)
    private postRepo:Repository<PostEntity>,
    private readonly postgres: PostgresService,
  ) {}


async createPost(userId: string, data: CreatePostInput) {
const post = await this.postRepo.save({
...data,
userId,
});

await this.kafka.emit('post.created', {
postId: post.id,
userId,
locationId: post.locationId,
});

return post;
}


async getFollowing(userId: string) {
const result = await this.postgres.query(
`
SELECT u.id, u.is_celebrity
FROM follows f
JOIN users u ON u.id = f.following_id
WHERE f.follower_id = $1
`,
[userId],
);

return result.rows;
}



async getPostsByIds(postIds: string[]): Promise<PostEntity[]> {
    if (!postIds.length) return [];

    return this.postRepository.find({
      where: { id: In(postIds) },
    });
  }

}