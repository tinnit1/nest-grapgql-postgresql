import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';
import { ListItemService } from 'src/list-item/list-item.service';
import { ListsService } from 'src/lists/lists.service';

@Injectable()
export class SeedService {

    private isProd: boolean;
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Item) 
        private readonly itemsRepository: Repository<Item>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        @InjectRepository(ListItem)
        private readonly listItemRepository: Repository<ListItem>,

        @InjectRepository(List)
        private readonly listRepository: Repository<List>,

        private readonly usersService: UsersService,
        private readonly itemsService: ItemsService,
        private readonly listItemService: ListItemService,
        private readonly listService: ListsService,
        ) {
            this.isProd = configService.get('STATE') === 'prod';
        }

  async executeSeed() {
    if (this.isProd) throw new UnauthorizedException('You are not authorized to seed the database');
    // Clean local database
    await this.deleteDatabase();
    // Create users
    const users = await this.loadUsers();
    // Create items
    await this.loadItems(users);
    // Create list
    const list = await this.loadList(users);
    // Create list item
    const items = await this.itemsService.findAll(users[0], { limit: 10, offset: 0 }, {});
    await this.loadListItem(list[0], items);
    return true;
  }

  async deleteDatabase() {
    await this.listItemRepository.delete({});
    await this.listRepository.delete({});
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

    async loadList(user: User[]): Promise<List[]> {
        const list = [];
        for (const item of SEED_LISTS) {
            list.push(await this.listService.create(item, user[Math.floor(Math.random() * user.length)]));
            }
        return list;
    }

    async loadListItem(list: List, items: Item[]) {
        for (const item of items) {
            this.listItemService.create({
                quantity: Math.floor(Math.random() * 10),
                completed: Math.floor(Math.random() * 1) === 0,
                itemId: item.id,
                listId: list.id,
            });
            }
    }
}
