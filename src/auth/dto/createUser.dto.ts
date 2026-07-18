import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import {
  GenderEnum,
  ProviderEnum,
  UserRoleEnum,
} from 'src/common/enums/user.enums';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 20, {
    message: 'FirstName must be between 2 and 20 characters long',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 20, {
    message: 'FirstName must be between 2 and 20 characters long',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  lastName!: string;

  @IsEmail({}, { message: 'please provide a valid email format' })
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  email!: string;

  @ValidateIf((dto: CreateUserDto) => dto.provider !== ProviderEnum.GOOGLE)
  @IsString()
  @IsNotEmpty()
  @Length(6, 100, {
    message: 'password must be at least 6 characters long',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  password!: string;

  @IsEnum(GenderEnum, {
    message: 'Gender value is not gender selection',
  })
  @IsOptional()
  gender!: GenderEnum;

  @IsEnum(ProviderEnum, {
    message: 'Provider value is not a valid authantication provider',
  })
  @IsOptional()
  provider!: ProviderEnum;

  @IsEnum(UserRoleEnum, {
    message: 'Role value is not a valid Role',
  })
  @IsOptional()
  role!: UserRoleEnum;
}
