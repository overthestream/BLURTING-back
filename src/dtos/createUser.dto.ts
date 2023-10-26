import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import {
  Sex,
  SexOrient,
  Mbti,
  Degree,
  Major,
  University,
  Character,
  Hobby,
} from 'src/common/enums';

export class CreateUserDto {
  @ValidateIf((o) => o.userName !== undefined && o.userName !== null)
  @IsString()
  userName: string;

  @ValidateIf((o) => o.email !== undefined && o.email !== null)
  @IsEmail()
  email: string;

  @ValidateIf((o) => o.IsPhoneNumber !== undefined && o.IsPhoneNumber !== null)
  @IsPhoneNumber()
  phoneNumber: string;

  @ValidateIf((o) => o.sex !== undefined && o.sex !== null)
  @IsEnum(Sex)
  sex: Sex;

  @ValidateIf((o) => o.sexOrient !== undefined && o.sexOrient !== null)
  @IsEnum(SexOrient)
  sexOrient: SexOrient;

  @ValidateIf((o) => o.region !== undefined && o.region !== null)
  @IsString()
  region: string;

  @ValidateIf((o) => o.religion !== undefined && o.religion !== null)
  @IsString()
  religion: string;

  @ValidateIf((o) => o.drink !== undefined && o.drink !== null)
  @IsEnum(Degree)
  drink: Degree;

  @ValidateIf((o) => o.cigarette !== undefined && o.cigarette !== null)
  @IsEnum(Degree)
  cigarette: Degree;

  @ValidateIf((o) => o.height !== undefined && o.height !== null)
  @IsNumber()
  height: number;

  @ValidateIf((o) => o.major !== undefined && o.major !== null)
  @IsEnum(Major)
  major: Major;

  @ValidateIf((o) => o.mbti !== undefined && o.mbti !== null)
  @IsEnum(Mbti)
  mbti: Mbti;

  @ValidateIf((o) => o.character !== undefined && o.character !== null)
  @IsArray()
  @IsEnum(Character, { each: true })
  character: Character[];

  @ValidateIf((o) => o.hobby !== undefined && o.hobby !== null)
  @IsArray()
  @IsEnum(Hobby, { each: true })
  hobby: Hobby[];

  @ValidateIf((o) => o.university !== undefined && o.university !== null)
  @IsEnum(University)
  university: University;
}

export class LoginDto {
  @IsNumber()
  id: number;
}
