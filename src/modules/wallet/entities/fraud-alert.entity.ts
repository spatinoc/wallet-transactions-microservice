import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({name: 'fraud_alerts'})
export class FraudAlert {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column('uuid')
  user_id: string;
  
  @Column('uuid')
  account_id: string;
  
  @CreateDateColumn({type: 'timestamptz'})
  triggered_at: Date;
  
  @Column({length: 100})
  rule: string;
  
  @Column({type: 'jsonb', nullable: true})
  detail: any;
  
}
