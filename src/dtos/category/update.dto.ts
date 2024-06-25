import { IsString, IsUUID } from 'class-validator';

export class UpdateCategoryDto {
  @IsUUID()
  @IsString()
  id: string;

  @IsString()
  name: string;
}
