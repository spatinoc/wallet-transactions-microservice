import { Module } from '@nestjs/common';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Account } from './entities/account.entity';
import { User } from './entities/user.entity';
import { FraudAlert } from './entities/fraud-alert.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account, Transaction, FraudAlert])
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService]
})
export class WalletModule {}
