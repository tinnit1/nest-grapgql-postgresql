import { Resolver, Query, Mutation, Args, Int, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { ValidRolesArgs } from './dto/args/roles.arg';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ValidRoles } from 'src/enums/valid-roles.enums';
import { ItemsService } from 'src/items/items.service';
import { Item } from 'src/items/entities/item.entity';
import { PaginationArgs } from 'src/common/dto/args/pagination.args';
import { SearchArgs } from 'src/common/dto/args/search.args';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService, private readonly itemService: ItemsService) {}

  @Query(() => [User], { name: 'users' })
  findAll(@Args() validRoles: ValidRolesArgs, @CurrentUser([ValidRoles.admin]) user: User): Promise<User[]> {

    return this.usersService.findAll(validRoles.roles);
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => ID }, ParseUUIDPipe) id: string, @CurrentUser([ValidRoles.admin]) user: User): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User, { name: 'updateUser' })
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput, @CurrentUser([ValidRoles.admin]) user: User) {
    return this.usersService.update(updateUserInput.id, updateUserInput, user);
  }

  @Mutation(() => User, { name: 'blockUser' })
  blockUser(@Args('id', { type: () => ID }, ParseUUIDPipe) id: string, @CurrentUser([ValidRoles.admin]) user: User): Promise<User> {
    return this.usersService.block(id, user);
  }

  @ResolveField(() => Int, { name: 'itemCount' })
  async itemCount(@Parent() user: User, @CurrentUser([ValidRoles.admin]) adminUser: User): Promise<number> {
    return this.itemService.itemCountByUser(user);
  }
  
  @ResolveField(() => [Item], { name: 'items' })
  async getItemsByUser(
    @Parent() user: User, 
    @CurrentUser([ValidRoles.admin]) adminUser: User,
    @Args() paginationArgs: PaginationArgs,
    @Args() searchArgs: SearchArgs): Promise<Item[]> {
    return this.itemService.findAll(user, paginationArgs, searchArgs);
  }
}
