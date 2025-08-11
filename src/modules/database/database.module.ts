import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../wallet/entities/user.entity';
import { Account } from '../wallet/entities/account.entity';
import { Transaction } from '../wallet/entities/transaction.entity';
import { FraudAlert } from '../wallet/entities/fraud-alert.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'wallet',
      entities: [User, Account, Transaction, FraudAlert],
      synchronize: false,
      logging: false
    })
  ]
})
export class DatabaseModule {}
