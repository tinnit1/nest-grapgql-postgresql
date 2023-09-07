import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Item } from 'src/items/entities/item.entity';
import { List } from 'src/lists/entities/list.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('listItems')
@Unique('listItem-item', ['list','item'])
@ObjectType()
export class ListItem {
  
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ type: 'numeric' })
  @Field(() => Number)
  quantity: number;

  @Field(() => Boolean)
  @Column({ type: 'boolean' })
  completed: boolean;

  // relations
  @ManyToOne(() => List, (list) => list.listItem, { lazy: true })
  // @Field(() => List)
  list: List;
  
  @ManyToOne(() => Item, (item) => item.listItem, { lazy: true })
  @Field(() => Item)
  item: Item;
}
