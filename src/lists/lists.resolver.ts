import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { ListsService } from './lists.service';
import { List } from './entities/list.entity';
import { CreateListInput } from './dto/create-list.input';
import { UpdateListInput } from './dto/update-list.input';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { PaginationArgs } from 'src/common/dto/args/pagination.args';
import { SearchArgs } from 'src/common/dto/args/search.args';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Resolver(() => List)
@UseGuards(JwtAuthGuard)
export class ListsResolver {
  constructor(private readonly listsService: ListsService) {}

  @Mutation(() => List, { name: 'createList' })
  createList(
    @Args('createListInput') createListInput: CreateListInput,
    @CurrentUser() user: User,): Promise<List> {
    return this.listsService.create(createListInput, user);
  }

  @Query(() => [List], { name: 'lists' })
  async findAll(
    @CurrentUser() user: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs
    ) {
    return this.listsService.findAll(user, paginationArgs, searchArgs);
  }

  @Query(() => List, { name: 'list' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @CurrentUser() user: User
    ) {
    return this.listsService.findOne(id, user);
  }

  @Mutation(() => List)
  updateList(
    @Args('updateListInput') updateListInput: UpdateListInput,
    @CurrentUser() user: User) {
    return this.listsService.update(updateListInput.id, updateListInput, user);
  }

  @Mutation(() => List)
  removeList(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User): Promise<List> {
    return this.listsService.remove(id, user);
  }
}
