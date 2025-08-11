import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';

@Entity({name: 'accounts'})
export class Account {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => User, (user) => user.accounts, {nullable: false})
  @JoinColumn({name: 'user_id'})
  user: User;
  
  @Column({type: 'numeric', precision: 18, scale: 2, default: 0})
  balance: string;
  
  @Column({length: 3, default: 'COP'})
  currency: string;
  
  @UpdateDateColumn({type: 'timestamptz'})
  updated_at: Date;
  
  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];
  
}
