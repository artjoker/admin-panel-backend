import { Matches } from 'class-validator';

class TokenDTO {
  @Matches(/^eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/]*$/)
  token: string;
}

export default TokenDTO;
