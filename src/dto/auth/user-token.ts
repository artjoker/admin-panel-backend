import { UserRole } from '../../entities/role';

interface UserTokenDTO {
  id: string;
  role: UserRole;
}

export default UserTokenDTO;
