import { Entity, Column, Unique, BeforeInsert } from 'typeorm';
import {
  Length,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  IsEnum,
  NotContains,
} from 'class-validator';
import * as bcrypt from 'bcryptjs';

import Model from './model';
import { UserRole } from './role';

@Entity('user')
@Unique(['email'])
export class User extends Model {
  @Column()
  @Length(1, 100)
  firstName: string;

  @Column()
  @Length(1, 100)
  lastName: string;

  @Column({ default: UserRole.USER })
  @IsEnum(UserRole)
  role: UserRole;

  @Column()
  @IsEmail(undefined, { message: 'Invalid email' })
  email: string;

  @Column()
  @Length(4, 100)
  @NotContains(' ')
  password: string;

  @Column('boolean')
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @BeforeInsert()
  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
