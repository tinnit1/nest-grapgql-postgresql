import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { SignupInput } from '../auth/dto/inputs/signup.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValidRoles } from 'src/enums/valid-roles.enums';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UsersService {
  private logger: Logger = new Logger('UserService');
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(SignupInput: SignupInput) {
    try {
      const newUser = this.usersRepository.create({
        ...SignupInput,
        password: bcrypt.hashSync(SignupInput.password, 10),
      });
      return await this.usersRepository.save(newUser);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(roles: ValidRoles[]): Promise<User[]> {
    try {
      if (roles.length === 0) return await this.usersRepository.find(
        // {relations: { lastUpdateBy: true }}
        );
      return await this.usersRepository.createQueryBuilder().where('ARRAY[role] && ARRAY[:...roles]').setParameter('roles', roles).getMany();
    } catch (error) {
      throw new InternalServerErrorException('Please check server logs');
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ email });
    } catch (error) {
      throw new NotFoundException(`${email} not found`);
    }
  }


  async findOneById(id: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException(`${id} not found`);
    }
  }

  // update(id: number, updateUserInput: UpdateUserInput) {
  //   return `This action updates a #${id} user`;
  // }

  async block(id: string, adminUser: User): Promise<User> {
    try {
      const userBlock = await this.findOneById(id);
      userBlock.isActive = false;
      userBlock.lastUpdateBy = adminUser;
     return await this.usersRepository.save(userBlock);
    } catch (error) {
      throw new InternalServerErrorException('Please check server logs');
    }
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key ', ''));
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Please check server logs');
  }

  async update(id: string, updateUserInput: UpdateUserInput, user: User): Promise<User> {
    try {
      const user = await this.usersRepository.preload({...updateUserInput, id });
      user.lastUpdateBy = user;
      return await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Please check server logs');
    }
  }
}
