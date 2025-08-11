import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Repository, DataSource } from 'typeorm';
import { Account } from '../entities/account.entity';
import { RegisterTransactionDto } from '../dtos/register-transaction.dto';
import WalletConstants from '../constants/wallet.constants';

@Injectable()
export class WalletService {
  
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Transaction) private _transactionRepository: Repository<Transaction>,
    @InjectRepository(Account) private _accountRepository: Repository<Account>,
    @InjectDataSource() private dataSource: DataSource
  ) {}

  async processTransaction(registerTransactionDto: RegisterTransactionDto) {
    
    const existingTransaction = await this._transactionRepository.findOne({where: {id: registerTransactionDto.transaction_id}});
    
    if (existingTransaction) {
      return existingTransaction;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      
      const account = await queryRunner.query(
        `SELECT * FROM accounts WHERE id = $1 FOR UPDATE`,
        [registerTransactionDto.account_id]
      );
      
      if (!account || account.length == 0) {
        throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
      }
      
      const accountRow = account[0];
      const currentBalance = parseFloat(accountRow.balance);
      const amount = Number(registerTransactionDto.amount);
      let newBalance = currentBalance;
      
      if (registerTransactionDto.type == 'withdraw') {
        
        if (currentBalance < amount) {
          throw new HttpException('Insufficient funds', HttpStatus.PAYMENT_REQUIRED);
        }
        
        newBalance = Number((currentBalance - amount).toFixed(2));
        
      } else {
        
        newBalance = Number((currentBalance + amount).toFixed(2));
        
      }

      await queryRunner.query(
        `UPDATE accounts SET balance = $1, updated_at = NOW() WHERE id = $2`,
        [newBalance.toString(), registerTransactionDto.account_id]
      );

      await queryRunner.query(
        `INSERT INTO transactions (id, user_id, account_id, amount, type, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          registerTransactionDto.transaction_id,
          registerTransactionDto.user_id,
          registerTransactionDto.account_id,
          amount.toFixed(2),
          registerTransactionDto.type,
          registerTransactionDto.timestamp
        ]
      );

      await queryRunner.commitTransaction();
      
      const createdTransaction = await this._transactionRepository.findOne({where: {id: registerTransactionDto.transaction_id}});

      try {
        
        const rows = await this.dataSource.query(
          `SELECT COUNT(*)::INT AS transactions_count FROM transactions
           WHERE user_id = $1 AND amount::NUMERIC >= $2 AND timestamp >= (NOW() - ($3 || ' minutes')::INTERVAL)`,
          [
            registerTransactionDto.user_id,
            WalletConstants.FRAUD_THRESHOLD.toFixed(2),
            WalletConstants.FRAUD_WINDOW_MINUTES
          ]
        );
        
        const transactionsCount = (rows && rows[0]) ? parseInt(rows[0].transactions_count) : 0;
        
        if (transactionsCount >= WalletConstants.FRAUD_COUNT) {
          
          const detail = {
            recent_high_transactions_count: transactionsCount,
            threshold: WalletConstants.FRAUD_THRESHOLD,
            window_minutes: WalletConstants.FRAUD_WINDOW_MINUTES
          };
          
          await this.dataSource.query(
            `INSERT INTO fraud_alerts (user_id, account_id, rule, detail, triggered_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [
              registerTransactionDto.user_id,
              registerTransactionDto.account_id,
              'multiple_transactions_alert',
              JSON.stringify(detail)
            ]
          );
          
          this.logger.warn(`Fraud alert created for user ${registerTransactionDto.user_id} (count=${transactionsCount})`);
          
        }
        
      } catch (err) {
        
        this.logger.error(`Error running fraud detection: ${err.message}`);
        
      }

      return createdTransaction;
      
    } catch (err) {
      
      await queryRunner.rollbackTransaction();
      
      if (err instanceof HttpException) {
        throw err;
      }
      
      throw new HttpException(err.message || 'Internal error', HttpStatus.INTERNAL_SERVER_ERROR);
      
    } finally {
      
      await queryRunner.release();
      
    }
    
  }

  async getTransactions(userId: string, offset = 0, limit = 20, from?: string, to?: string) {
    
    const queryBuilder = this._transactionRepository
      .createQueryBuilder('transactions')
      .where('transactions.user_id = :userId', {userId})
      .orderBy('transactions.timestamp', 'DESC')
      .limit(limit)
      .offset(offset);
    
    if (from) {
      queryBuilder.andWhere('transactions.timestamp >= :from', {from});
    }
    
    if (to) {
      queryBuilder.andWhere('transactions.timestamp <= :to', {to});
    }
    
    return queryBuilder.getMany();
    
  }

  async getBalance(userId: string) {
    
    const account = await this._accountRepository
      .createQueryBuilder('accounts')
      .innerJoinAndSelect('accounts.user', 'user')
      .where('user.id = :userId', {userId})
      .getOne();
    
    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
    
    return {
      balance: account.balance,
      currency: account.currency,
      updated_at: account.updated_at
    };
    
  }
  
}
