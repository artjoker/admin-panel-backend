import { NextFunction, Request, Response } from 'express';

import { UserService } from '../services';
import { FindUsersDTO, CreateUserDTO, UpdateUserDTO } from '../dto';
import { AppError, HttpCode } from '../exceptions';
import { validateDTO } from '../utils';
import { IGetUserAuthInfoRequest } from '../types/request';

export class UserController {
  private isPublicApi: boolean;
  private userService: UserService;

  constructor({ isPublicApi }: { isPublicApi: boolean }) {
    this.isPublicApi = isPublicApi;
    this.userService = new UserService({ isPublicApi });
  }

  public getCurrentUser = async (
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      throw new Error('User is empty (not logged in)');
    }
    try {
      const foundUser = await this.userService.getUserById(req.user.id);
      res.status(200).json(foundUser);
    } catch (err) {
      next(err);
    }
  };

  public updateCurrentUser = async (
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = req.user?.id;

      if (!id) {
        throw new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: 'Invalid request',
        });
      }

      const updateUserDTO = new UpdateUserDTO();

      updateUserDTO.id = id;
      updateUserDTO.firstName = req.body.firstName?.trim();
      updateUserDTO.lastName = req.body.lastName?.trim();
      updateUserDTO.email = req.body.email?.toLowerCase().trim();
      updateUserDTO.password = req.body.password;

      if (req.body.password.includes(' ')) {
        throw new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: 'password must not contain a space',
        });
      }

      await validateDTO(updateUserDTO);

      const user = await this.userService.updateUser(updateUserDTO);

      return res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  public findUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const findUsersDTO = new FindUsersDTO();

      findUsersDTO.filters = req.body.filters;
      findUsersDTO.sort = req.body.sort;
      findUsersDTO.search = req.body.search;
      findUsersDTO.page = req.body.page;
      findUsersDTO.perPage = req.body.perPage;

      await validateDTO(findUsersDTO);

      const responseDTO = await this.userService.findUsers(findUsersDTO);

      res.status(200).json(responseDTO);
    } catch (err) {
      next(err);
    }
  };

  public getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  public createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const createUserDTO = new CreateUserDTO();

      createUserDTO.firstName = req.body.firstName?.trim();
      createUserDTO.lastName = req.body.lastName?.trim();
      createUserDTO.email = req.body.email?.toLowerCase().trim();
      createUserDTO.password = req.body.password;
      createUserDTO.isActive = req.body.isActive;

      if (req.body.password.includes(' ')) {
        throw new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: 'password must not contain a space',
        });
      }

      await validateDTO(createUserDTO);

      const user = await this.userService.createUser(createUserDTO);

      return res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  };

  public updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const updateUserDTO = new UpdateUserDTO();

      updateUserDTO.id = id;
      updateUserDTO.firstName = req.body.firstName?.trim();
      updateUserDTO.lastName = req.body.lastName?.trim();
      updateUserDTO.email = req.body.email?.toLowerCase().trim();
      updateUserDTO.isActive = req.body.isActive;
      updateUserDTO.password = req.body.password;

      if (req.body.password.includes(' ')) {
        throw new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: 'password must not contain a space',
        });
      }

      await validateDTO(updateUserDTO);

      const user = await this.userService.updateUser(updateUserDTO);

      return res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  public deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const user = await this.userService.deleteUser(id);

      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };
}
