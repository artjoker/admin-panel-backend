import { UserRole } from '../entities/role';

export const config = {
  PORT: process.env.PORT || 3000,
  SECRET_KEY: process.env.SECRET_KEY || 'secret',
  ADMIN_CREDS: {
    email: process.env.ADMIN_EMAIL || 'admin@admin.com',
    password: process.env.ADMIN_PASSWORD || 'Qwerty12345',
    isActive: false,
    firstName: 'Admin',
    lastName: 'Admin',
    role: UserRole.ADMIN,
  },
  PAGE: 1,
  PER_PAGE: 10,
};
