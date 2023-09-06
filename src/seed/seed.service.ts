import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';

@Injectable()
export class SeedService {

    private isProd: boolean;
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Item) 
        private readonly itemsRepository: Repository<Item>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService,
        ) {
            this.isProd = configService.get('STATE') === 'prod';
        }

  async executeSeed() {
    if (this.isProd) throw new UnauthorizedException('You are not authorized to seed the database');
    // Clean local database
    await this.deleteDatabase();
    // Create users
    const user = await this.loadUsers();
    // Create items
    await this.loadItems(user);
    return true;
  }

  async deleteDatabase() {
    await this.itemsRepository.delete({});
    await this.usersRepository.delete({});
}
    async loadUsers(): Promise<User[]> {
        const users = [];
        for (const user of SEED_USERS) {
            users.push(await this.usersService.create(user));
            }
        return users;
    }

    async loadItems(user: User[]): Promise<Item> {
        const items = [];
        for (const item of SEED_ITEMS) {
            items.push(await this.itemsService.create(item, user[Math.floor(Math.random() * user.length)]));
            }
        return items[0];
    }
}
