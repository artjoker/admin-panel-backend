import UserTokenDTO from '../dto/auth/user-token';
import { Request } from 'express';

export interface IGetUserAuthInfoRequest extends Request {
  user?: UserTokenDTO;
}
