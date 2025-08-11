import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity({name: 'transactions'})
export class Transaction {
  
  @PrimaryColumn('uuid')
  id: string;
  
  @Column('uuid')
  user_id: string;
  
  @ManyToOne(() => Account, (account) => account.transactions, {nullable: false})
  @JoinColumn({name: 'account_id'})
  account: Account;
  
  @Column({type: 'numeric', precision: 18, scale: 2})
  amount: string;
  
  @Column({length: 10})
  type: string;
  
  @Column({type: 'timestamptz'})
  timestamp: Date;
  
}
