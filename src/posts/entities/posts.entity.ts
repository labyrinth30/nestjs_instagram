import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UsersModel } from '../../users/entities/users.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { IsString } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { Transform } from 'class-transformer';
import { join } from 'path';
import { POST_PUBLIC_IMAGE_PATH } from '../../common/const/path.const';

@Entity()
export class PostsModel extends BaseModel{

  // 1) UsersModel과 외래키를 이용하여 연결한다.
  // 2) Nullable: false
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false
  })
  author: UsersModel;
  @Column()
  @IsString({
    message: stringValidationMessage
  })
  title: string;
  @Column()
  @IsString({
    message: stringValidationMessage
  })
  content: string;

  @Column({
    nullable: true,
  })
  @Transform(({value}) => value && `/${join(POST_PUBLIC_IMAGE_PATH,value)}`)
  image?: string;

  @Column()
  likeCount: number;
  @Column()
  commentCount: number;
}
