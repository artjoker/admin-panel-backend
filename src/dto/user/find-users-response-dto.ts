import UserDTO from './user-dto';

interface FindUsersResponseDTO {
  data: UserDTO[];
  page: number;
  perPage: number;
  totalPages: number;
}

export default FindUsersResponseDTO;
