import { WalletService } from './wallet.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('WalletService (Unit Tests)', () => {
  
  let service: WalletService;
  let transactionRepository: any;
  let accountRepository: any;
  let dataSource: any;
  let queryRunner: any;
  
  beforeEach(() => {
    
    transactionRepository = {
      findOne: jest.fn()
    };
    
    accountRepository = {};
    
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      query: jest.fn()
    };
    
    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
      query: jest.fn()
    };
    
    service = new WalletService(
      transactionRepository,
      accountRepository,
      dataSource
    );
    
  });
  
  it('should throw if amount <= 0', async () => {
    
    const transactionDto: any = {
      transaction_id: 'transaction1',
      user_id: 'user1',
      account_id: 'account1',
      amount: 0,
      type: 'deposit',
      timestamp: new Date().toISOString()
    };
    
    await expect(service.processTransaction(transactionDto)).rejects.toThrow(HttpException);
    
  });
  
  it('should throw if account not found', async () => {
    
    transactionRepository.findOne.mockResolvedValue(null);
    queryRunner.query.mockResolvedValueOnce([]);
    
    const transactionDto: any = {
      transaction_id: 'transaction1',
      user_id: 'user1',
      account_id: 'account1',
      amount: 100000.00,
      type: 'deposit',
      timestamp: new Date().toISOString()
    };
    
    await expect(service.processTransaction(transactionDto)).rejects.toMatchObject({
      status: HttpStatus.NOT_FOUND
    });
    
  });
  
  it('should process deposit and commit', async () => {
    
    transactionRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({id: 'transaction1'});
    
    queryRunner.query
      .mockResolvedValueOnce([{balance: '150000.00'}])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);
    
    queryRunner.commitTransaction.mockResolvedValue(undefined);
    transactionRepository.findOne.mockResolvedValueOnce({id: 'transaction1'});
    
    const transactionDto: any = {
      transaction_id: 'transaction1',
      user_id: 'user1',
      account_id: 'account1',
      amount: 100000.00,
      type: 'deposit',
      timestamp: new Date().toISOString()
    };
    
    const result = await service.processTransaction(transactionDto);
    
    expect(result).toMatchObject({id: 'transaction1'});
    expect(queryRunner.query).toHaveBeenCalledTimes(3);
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
    
  });
  
});
