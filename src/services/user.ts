import { Brackets } from 'typeorm';

import { User } from '../entities';
import AppDataSource from '../app-data-source';
import {
  CreateUserDTO,
  FindUsersDTO,
  UpdateUserDTO,
  UserDTO,
  FindUsersResponseDTO,
  LoginDTO,
} from '../dto';
import { mapUserToDTO } from '../mappers';
import { AppError, HttpCode } from '../exceptions';
import { UserRole } from '../entities/role';

export class UserService {
  private isPublicApi: boolean;
  private repository = AppDataSource.getRepository(User);

  constructor({ isPublicApi }: { isPublicApi: boolean }) {
    this.isPublicApi = isPublicApi;
  }

  public findUserWhenLogin = async ({
    email,
    password,
  }: LoginDTO): Promise<UserDTO> => {
    const user = await this.repository.findOneBy({ email });

    /**
     * True when api is public and user role != admin
     */
    const adminError = this.isPublicApi ? false : user?.role !== UserRole.ADMIN;

    if (!user) {
      throw new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: `User with email ${email} does not exist`,
      });
    }

    if (adminError) {
      throw new AppError({
        httpCode: HttpCode.FORBIDDEN,
        description: `Forbidden`,
      });
    }

    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      throw new AppError({
        httpCode: HttpCode.UNAUTHORIZED,
        description: 'Wrong password',
      });
    }

    return mapUserToDTO(user);
  };

  public findUsers = async (
    findUsersDTO: FindUsersDTO
  ): Promise<FindUsersResponseDTO> => {
    const { filters, search, page, perPage, sort } = findUsersDTO;

    let query = this.repository.createQueryBuilder('data').where('1 = 1');

    if (search) {
      query = query.andWhere(
        new Brackets((qb) => {
          qb.andWhere('data.firstName ILIKE :q', { q: `%${search}%` })
            .orWhere('data.lastName ILIKE :q', { q: `%${search}%` })
            .orWhere('data.email ILIKE :q', { q: `%${search}%` });
        })
      );
    }

    if (filters?.firstName) {
      query = query.andWhere('data.firstName ILIKE :firstName', {
        firstName: `%${filters.firstName}%`,
      });
    }

    if (filters?.lastName) {
      query = query.andWhere('data.lastName ILIKE :lastName', {
        lastName: `%${filters.lastName}%`,
      });
    }

    if (filters?.email) {
      query = query.andWhere('data.email ILIKE :email', {
        email: `%${filters.email}%`,
      });
    }

    if (typeof filters?.isActive === 'boolean') {
      query = query.andWhere({ isActive: filters.isActive });
    }

    if (sort) {
      Object.entries(sort).forEach(([key, value]) => {
        query.addOrderBy(`data.${key}`, value);
      });
    } else {
      query.orderBy('data.createdAt', 'DESC');
    }

    const [users, count] = await query
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();

    const mappedUsers = users.map(mapUserToDTO);

    const responseDTO: FindUsersResponseDTO = {
      data: mappedUsers,
      page,
      perPage,
      totalPages: Math.ceil(count / perPage),
    };

    return responseDTO;
  };

  public getUserById = async (id: string): Promise<UserDTO> => {
    const user = await this.repository.findOneBy({ id });

    if (!user) {
      throw new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: `User with id - ${id} does not exist`,
      });
    }

    return mapUserToDTO(user);
  };

  public createUser = async (
    createUserDTO: CreateUserDTO
  ): Promise<UserDTO> => {
    const foundUser = await this.repository.findOneBy({
      email: createUserDTO.email,
    });

    if (foundUser) {
      throw new AppError({
        httpCode: HttpCode.BAD_REQUEST,
        description: `User with email - ${createUserDTO.email} already exists`,
      });
    }

    const user = await this.repository.save(
      this.repository.create(createUserDTO)
    );

    return mapUserToDTO(user);
  };

  public updateUser = async (
    updateUserDTO: UpdateUserDTO
  ): Promise<UserDTO> => {
    const foundUser = await this.repository.findOneBy({ id: updateUserDTO.id });

    if (!foundUser) {
      throw new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: `User with id - ${updateUserDTO.id} does not exist`,
      });
    }

    foundUser.firstName = updateUserDTO.firstName ?? foundUser.firstName;
    foundUser.lastName = updateUserDTO.lastName ?? foundUser.lastName;
    foundUser.email = updateUserDTO.email ?? foundUser.email;
    foundUser.isActive = updateUserDTO.isActive ?? foundUser.isActive;

    if (updateUserDTO.password) {
      foundUser.password = updateUserDTO.password;
      foundUser.hashPassword();
    }

    await this.repository.save(foundUser);

    const user = (await this.repository.findOneBy({
      id: updateUserDTO.id,
    })) as User;

    return mapUserToDTO(user);
  };

  public deleteUser = async (id: string): Promise<UserDTO> => {
    const foundUser = await this.repository.findOneBy({ id });

    if (!foundUser) {
      throw new AppError({
        httpCode: HttpCode.NOT_FOUND,
        description: `User with id - ${id} does not exist`,
      });
    }

    const user = await foundUser.remove();

    return mapUserToDTO(user);
  };
}
