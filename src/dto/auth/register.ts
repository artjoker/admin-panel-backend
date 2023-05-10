import { Length, IsEmail, IsString, NotContains } from 'class-validator';

class RegisterDTO {
  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsEmail()
  email: string;

  @Length(4, 100)
  @NotContains(' ')
  password: string;
}

export default RegisterDTO;
