import {
  Body,
  ClassSerializerInterceptor,
  Controller, DefaultValuePipe, Delete,
  Get,
  Param, ParseBoolPipe,
  ParseIntPipe, Patch,
  Post, Query,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from './decorator/roles.decorator';
import { RolesEnum } from './const/roles.const';
import { UsersModel } from './entity/users.entity';
import { User } from './decorator/user.decorator';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner as QR } from 'typeorm';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';

@Controller('users')
@ApiTags('유저 API')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '유저 생성하기', description: '유저를 생성합니다.'})
  postUser(
    @Body('nickname') body: CreateUserDto
  ){
    return this.usersService.createUser(body);
  }

  @Get()
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: '유저 전체 조회', description: '모든 유저를 조회합니다.'})
  /**
   * serialization -> 직렬화 -> 현재 시스템에서 사용되는 (NestJS) 데이터의 구조를 다른 시스템에서도 사용할 수 있는 포맷으로 변환
   * 여기서는 class의 object -> JSON으로 변환
   *
   * deserialization -> 역직렬화 -> 다른 시스템에서 사용되는 데이터의 구조를 현재 시스템에서 사용하는 포맷으로 변환
   */
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('follow/me')
  async getFollow(
    @User() user: UsersModel,
    @Query('includeNotConfirmed', new DefaultValuePipe(false), ParseBoolPipe) includeNotConfirmed: boolean,
  ){
    return this.usersService.getFollowers(user.id, includeNotConfirmed);
  }

  @Post('follow/:id')
  async postFollow(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followeeId: number,
  ){
    await this.usersService.followUser(
      user.id, followeeId
    );

    return true;
  }

  @Patch('follow/:id/confirm')
  @UseInterceptors(TransactionInterceptor)
  async patchFollowConfirm(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followerId: number,
    @QueryRunner() qr: QR,
  ){
    await this.usersService.confirmFollow(followerId, user.id, qr);
    await this.usersService.increaseFollowerCount(user.id,'followerCount' ,qr);
    await this.usersService.increaseFollowerCount(followerId,'followeeCount' ,qr);
    return true;
  }

  @Delete('follow/:id')
  @UseInterceptors(TransactionInterceptor)
  async deleteFollow(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followeeId: number,
    @QueryRunner() qr: QR,
  ){
    await this.usersService.deleteFollow(user.id, followeeId, qr);
    await this.usersService.decreaseFollowerCount(user.id, 'followerCount', qr);
    await this.usersService.decreaseFollowerCount(followeeId,'followeeCount', qr);

    return true;
  }

}
