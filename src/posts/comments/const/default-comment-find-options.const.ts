import { FindManyOptions } from 'typeorm';
import { CommentsModel } from '../entity/comments.entity';

export const DEFAULT_COMMENT_FIND_OPTIONS: FindManyOptions<CommentsModel> = {
  relations: ['author'],
  select: {
    author: {
      id: true,
      nickname: true,
    },
  }
}