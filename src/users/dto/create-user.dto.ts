import { IsOptional, IsString } from 'class-validator';
import { PickType } from '@nestjs/swagger';
import { UsersModel } from '../entity/users.entity';


export class CreateUserDto extends PickType(UsersModel, ['email', 'nickname', 'password']) {
  @IsString()
  @IsOptional()
  image?: string;
}