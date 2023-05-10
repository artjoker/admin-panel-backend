import { Length, IsEmail, NotContains } from 'class-validator';

class LoginDTO {
  @IsEmail()
  email: string;

  @Length(4, 100)
  @NotContains(' ')
  password: string;
}

export default LoginDTO;
