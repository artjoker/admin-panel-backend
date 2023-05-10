import { UserDTO } from '../dto';
import { User } from '../entities';

export const mapUserToDTO = (user: User): UserDTO => ({
  id: user.id,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  isActive: user.isActive,
  role: user.role,
});
