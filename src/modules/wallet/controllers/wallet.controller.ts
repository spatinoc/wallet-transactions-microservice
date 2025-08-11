import { Controller, Post, Body, HttpException, HttpStatus, Get, Param, Query } from '@nestjs/common';
import { RegisterTransactionDto } from '../dtos/register-transaction.dto';
import { WalletService } from '../services/wallet.service';

@Controller()
export class WalletController {
  
  constructor(
    private readonly _walletService: WalletService
  ) {}
  
  @Get('health')
  health() {
    return {status: 'ok'};
  }

  @Post('transactions')
  async create(@Body() registerTransactionDto: RegisterTransactionDto) {
    
    try {
      
      const transaction = await this._walletService.processTransaction(registerTransactionDto);
      return {success: true, transaction};
      
    } catch (err) {
      
      throw new HttpException({message: err.message}, err.status || HttpStatus.BAD_REQUEST);
      
    }
    
  }

  @Get('users/:userId/transactions')
  async history(
    @Param('userId') userId: string,
    @Query('offset') offset = '0',
    @Query('limit') limit = '20',
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    
    const requestOffset = parseInt(offset) || 0;
    const requestLimit = parseInt(limit) || 20;
    
    return this._walletService.getTransactions(userId, requestOffset, requestLimit, from, to);
    
  }

  @Get('users/:userId/balance')
  async balance(@Param('userId') userId: string) {
    return this._walletService.getBalance(userId);
  }
  
}
