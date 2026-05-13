import {  Injectable,} from '@nestjs/common';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import { PostVisibility } from '../../../post/enums/post-visibility.enum';

@Injectable()
export class VisibilityService {

  constructor(

    private readonly redis:
      RedisService,
  ) {}

  // =====================================================
  // CAN VIEW POST
  // =====================================================

  async canViewPost(params: {
    viewerId?: string;
    authorId: string;
    visibility: PostVisibility;
    viewerLocationId?: string;
    postLocationId?: string;
  }) {

    const {
      viewerId,
      authorId,
      visibility,
      viewerLocationId,
      postLocationId,
    } = params;

    // ================================================
    // OWNER ALWAYS SEES
    // ================================================

    if (viewerId && viewerId === authorId    ) {
      return true;
    }

    // ================================================
    // PUBLIC
    // ================================================

    if (visibility ===  PostVisibility.PUBLIC) {
      return true;
    }




    
    // ================================================
    // FOLLOWERS
    // ================================================

    if (visibility === PostVisibility.FOLLOWERS  ) {
      if (!viewerId) {
        return false;
      }
      return this.redis.client.sismember(`followers:${authorId}`,viewerId,);
    }

   
   
   
   
    // ================================================
    // LOCAL
    // ================================================

    if (visibility === PostVisibility.LOCAL) {
      if (!viewerLocationId || !postLocationId) {
        return false;
      }
      return (viewerLocationId === postLocationId);
    }

    return false;
  }
}