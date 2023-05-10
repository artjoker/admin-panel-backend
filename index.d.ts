import UserTokenDTO from './src/dto/auth/user-token';

declare global {
  namespace Express {
    interface Request {
      user?: UserTokenDTO;
    }
  }
}
