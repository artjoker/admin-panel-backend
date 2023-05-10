import { validate } from 'class-validator';

import { AppError, HttpCode } from '../exceptions';

const validateDTO = async (dto: object) => {
  const validationErrors = await validate(dto);

  if (!validationErrors.length) {
    return;
  }

  throw new AppError({
    httpCode: HttpCode.BAD_REQUEST,
    description: 'Invalid request',
    validationErrors,
  });
};

export default validateDTO;
