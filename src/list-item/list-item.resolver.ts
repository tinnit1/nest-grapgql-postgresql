import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { ListItemService } from './list-item.service';
import { ListItem } from './entities/list-item.entity';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { PaginationArgs } from 'src/common/dto/args/pagination.args';
import { SearchArgs } from 'src/common/dto/args/search.args';
import { List } from 'src/lists/entities/list.entity';

@Resolver(() => ListItem)
@UseGuards(JwtAuthGuard)
export class ListItemResolver {
  constructor(
    private readonly listItemService: ListItemService,
    
    ) {}

  @Mutation(() => ListItem)
  createListItem(
    @Args('createListItemInput') createListItemInput: CreateListItemInput,
    
    ): Promise<ListItem> {
    return this.listItemService.create(createListItemInput);
  }

  @Query(() => [ListItem], { name: 'listItem' })
  findAll(
    @CurrentUser() list: List,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs
    ): Promise<ListItem[]> {
    return this.listItemService.findAll(list, paginationArgs, searchArgs);
  }

  @Query(() => ListItem, { name: 'listItem' })
  findOne(@Args('id', { type: () => ID }, ParseUUIDPipe) id: string) {
    return this.listItemService.findOne(id);
  }

  @Mutation(() => ListItem)
  updateListItem(
    @Args('updateListItemInput') updateListItemInput: UpdateListItemInput
    ): Promise<ListItem> {
    return this.listItemService.update(updateListItemInput.id, updateListItemInput);
  }

  // @Mutation(() => ListItem)
  // removeListItem(@Args('id', { type: () => Int }) id: number) {
  //   return this.listItemService.remove(id);
  // }
}
