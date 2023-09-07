import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ListItem } from './entities/list-item.entity';
import { PaginationArgs } from 'src/common/dto/args/pagination.args';
import { SearchArgs } from 'src/common/dto/args/search.args';
import { User } from 'src/users/entities/user.entity';
import { List } from 'src/lists/entities/list.entity';

@Injectable()
export class ListItemService {

  constructor(
    @InjectRepository(ListItem)
    private readonly listItemRepository: Repository<ListItem>,
    ){}

  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
    const { itemId, listId, ...rest } = createListItemInput;
    const newListItem = this.listItemRepository.create(
      {
        ...rest,
        item: { id: itemId },
        list: { id: listId },
      }
      );
    await this.listItemRepository.save(newListItem);
    return this.findOne(newListItem.id);
  }

  async findAll(
    list: List, 
    paginationArgs: PaginationArgs, 
    searchArgs: SearchArgs
    ): Promise<ListItem[]> {

      const { limit, offset } = paginationArgs;
      const { search } = searchArgs;
      const query = this.listItemRepository.createQueryBuilder('listItem')
      .innerJoinAndSelect('listItem.item', 'item')
      .take(limit)
      .skip(offset)
      .where('listItem.listId = :listId', { listId: list.id });

      if (search) {
        query.andWhere('item.name ILIKE :search', { search: `%${search}%` });
      }
    return query.getMany();
  }

  async findOne(id: string): Promise<ListItem> {
    const item = await this.listItemRepository.findOneBy({ id });
    if (!item) throw new NotFoundException(`Item with ID ${id} not found`);
    return item;
  }

  async update(
    id: string, 
    updateListItemInput: UpdateListItemInput
    ): Promise<ListItem> {
    const { itemId, listId, ...rest } = updateListItemInput;
    // const lisItem = await this.listItemRepository.preload({
    //   ...rest,
    //   item: { id: itemId },
    //   list: { id: listId },
    // });
    // if (!lisItem) throw new NotFoundException(`Item with ID ${id} not found`);
    // return this.listItemRepository.save(lisItem);
    const queryBuilder = 
    this.listItemRepository.createQueryBuilder('listItem')
    .update()
    .set(rest)
    .where('id = :id', { id });

    if ( listId) queryBuilder.set({ list: { id: listId } });
    if ( itemId) queryBuilder.set({ item: { id: itemId } });

    await queryBuilder.execute();

    return this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }

  count(list: List, searchArgs: SearchArgs): Promise<number> {
    const { search } = searchArgs;
    const query = this.listItemRepository.createQueryBuilder('listItem')
    .innerJoinAndSelect('listItem.item', 'item')
    .where('listItem.listId = :listId', { listId: list.id });

    if (search) {
      query.andWhere('item.name ILIKE :search', { search: `%${search}%` });
    }
    return query.getCount();
  }

}
