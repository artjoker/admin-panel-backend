import { UserRole } from '../../entities/role';

interface UserDTO {
  id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export default UserDTO;
