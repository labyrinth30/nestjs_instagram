import { IsOptional, IsString } from 'class-validator';
import { PostsModel } from '../entity/posts.entity';
import { PickType } from '@nestjs/swagger';

// Pick, Omit, Partial -> Type 반환
// PickType, OmitType, PartialType -> 값을 반환
export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  @IsString({
    each: true,
  })
  @IsOptional()
  images: string[];
}