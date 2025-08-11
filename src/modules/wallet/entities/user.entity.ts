import { Entity, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, Column } from 'typeorm';
import { Account } from './account.entity';

@Entity({name: 'users'})
export class User {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({length: 128})
  name: string;
  
  @Column({length: 128})
  last_name: string;
  
  @Column({type: 'numeric', precision: 18})
  document: string;
  
  @CreateDateColumn({type: 'timestamptz'})
  created_at: Date;
  
  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];
  
}
