import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { QueryRunner as QR } from 'typeorm';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { UsersModel } from '../../users/entity/users.entity';
import { User } from '../../users/decorator/user.decorator';
import { UpdateCommentsDto } from './dto/update-comments.dto';
import { IsPublic } from '../../common/decorator/is-public.decorator';
import { IsCommentMineOrAdminGuard } from './guard/is-comment-mine-or-admin.guard';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { PostsService } from '../posts.service';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
    ) {
    /**
     * 1) Entity 생성
     * author: string -> 작성자
     * post: Post -> 댓글이 달린 게시글
     * comment: string -> 댓글 내용
     * likeCount: number -> 좋아요 수
     *
     * id: number -> 댓글 고유번호(PrimaryGeneratedColumn)
     * createdAt: Date -> 생성일자(CreateDateColumn)
     * updatedAt: Date -> 수정일자(UpdateDateColumn)
     *
     *
     * 2) Get() paginate
     * 3) Get(':commentId') 특정 댓글 조회
     * 4) Post() 댓글 생성
     * 5) Patch(':commentId') 댓글 수정
     * 6) Delete(':commentId') 댓글 삭제
     */
  }
  @Get()
  @IsPublic()
  getComments(
    @Query() query: PaginateCommentsDto,
    @Param('postId', ParseIntPipe) postId: number,
  ){
    return this.commentsService.paginateComments(query, postId);
  }

  @Get(':commentId')
  @IsPublic()
  getComment(
    @Param('commentId', ParseIntPipe) commentId: number,
  ){
    return this.commentsService.getCommentById(commentId);
  }
  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: CreateCommentsDto,
    @User() user: UsersModel,
    @QueryRunner() qr?: QR,
  ){
    const response =  await this.commentsService.createComment(
      body,
      postId,
      user,
      qr,
      );

    await this.postsService.incrementCommentCount(postId, qr);
    return response;
  }

  @Patch(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  patchComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: UpdateCommentsDto,
  ){
    return this.commentsService.updateComment(commentId, body);
  }

  @Delete(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  @UseInterceptors(TransactionInterceptor)
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @QueryRunner() qr?: QR,
  ){
    const response = await this.commentsService.deleteComment(
      commentId,
      qr,
      );
    await this.postsService.decrementCommentCount(postId, qr);

    return response;
  }
}

