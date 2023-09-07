import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'items' })
@ObjectType()
export class Item {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  quantityUnits?: string;

  // @Field()
  // @Column()
  // description: string;

  // @Field(() => Float)
  // @Column()
  // quantity: number;

  @ManyToOne(() => User, (user) => user.lists, { nullable: false, lazy: true })
  @Index('item_user_id_index')
  @Field(() => User)
  user: User;
}
