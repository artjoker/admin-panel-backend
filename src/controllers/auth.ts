import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { config } from '../constants/config';
import { CreateUserDTO, LoginDTO, RegisterDTO, UserDTO } from '../dto';
import UserTokenDTO from '../dto/auth/user-token';
import { UserRole } from '../entities/role';
import { AppError, HttpCode } from '../exceptions';
import { UserService } from '../services';
import { IGetUserAuthInfoRequest } from '../types/request';
import { validateDTO } from '../utils';

interface TokenPayload extends JwtPayload, UserTokenDTO {}

export class AuthController {
  private isPublicApi: boolean;
  private userService: UserService;

  constructor({ isPublicApi }: { isPublicApi: boolean }) {
    this.isPublicApi = isPublicApi;
    this.userService = new UserService({ isPublicApi });
  }

  public generateToken = (user: UserDTO): string => {
    const payload: TokenPayload = { id: user.id, role: user.role };
    return jwt.sign(payload, config.SECRET_KEY);
  };

  private verifyToken = (token: string): TokenPayload => {
    try {
      const payload = jwt.verify(token, config.SECRET_KEY) as TokenPayload;
      return payload;
    } catch (err) {
      throw new AppError({
        httpCode: HttpCode.BAD_REQUEST,
        description: 'Invalid request',
      });
    }
  };

  public authMiddleware = (
    req: IGetUserAuthInfoRequest,
    _res: Response,
    next: NextFunction
  ) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError({
        httpCode: HttpCode.UNAUTHORIZED,
        description: 'Unauthorized',
      });
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.verifyToken(token);

      if (!this.isPublicApi && payload.role !== UserRole.ADMIN) {
        throw new AppError({
          httpCode: HttpCode.FORBIDDEN,
          description: 'Forbidden',
        });
      }

      req.user = { id: payload.id, role: payload.role };
      next();
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginDTO = new LoginDTO();

      loginDTO.email = req.body.email;
      loginDTO.password = req.body.password;

      await validateDTO(loginDTO);

      const user = await this.userService.findUserWhenLogin(loginDTO);

      const token = this.generateToken(user);

      res.json({ token });
    } catch (err) {
      next(err);
    }
  };

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const registerDTO = new RegisterDTO();

      registerDTO.firstName = req.body.firstName;
      registerDTO.lastName = req.body.lastName;
      registerDTO.email = req.body.email;
      registerDTO.password = req.body.password;

      await validateDTO(registerDTO);

      const createUserDTO = new CreateUserDTO();

      createUserDTO.firstName = registerDTO.firstName;
      createUserDTO.lastName = registerDTO.lastName;
      createUserDTO.email = registerDTO.email;
      createUserDTO.password = registerDTO.password;
      createUserDTO.role = UserRole.USER;
      createUserDTO.isActive = true;

      await validateDTO(createUserDTO);

      const user = await this.userService.createUser(createUserDTO);

      const token = this.generateToken(user);

      res.json({ token });
    } catch (err) {
      next(err);
    }
  };
}
