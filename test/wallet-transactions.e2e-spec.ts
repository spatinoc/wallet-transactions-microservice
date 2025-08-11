import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletModule } from '../src/modules/wallet/wallet.module';

describe('Wallet Transactions (E2E)', () => {
  
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  
  const userId = '885b065d-e0d3-4aa6-b2f7-4eec4d8573f6';
  const accountId = 'f66d1a10-c7f9-4100-bcad-f67d498a8eb1';
  
  beforeAll(async () => {
    
    process.env.FRAUD_THRESHOLD = '150000';
    process.env.FRAUD_WINDOW_MINUTES = '60';
    process.env.FRAUD_COUNT = '2';
    
    container = await new PostgreSqlContainer('postgres:15')
      .withDatabase('testdb')
      .withUsername('test')
      .withPassword('test')
      .start();
    
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async () => ({
            type: 'postgres',
            host: container.getHost(),
            port: container.getPort(),
            username: container.getUsername(),
            password: container.getPassword(),
            database: container.getDatabase(),
            entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
            synchronize: true,
          }),
        }),
        WalletModule
      ]
    }).compile();
    
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}));
    
    await app.init();
    
    dataSource = moduleRef.get(DataSource);
    
  });
  
  afterAll(async () => {
    
    await app.close();
    await container.stop();
    
  });
  
  beforeEach(async () => {
    
    await dataSource.query(`DELETE FROM fraud_alerts`);
    await dataSource.query(`DELETE FROM transactions`);
    await dataSource.query(`DELETE FROM accounts`);
    await dataSource.query(`DELETE FROM users`);
    
    await dataSource.query(
      `INSERT INTO users (id, name, last_name, document) VALUES ($1, $2, $3, $4)`,
      [userId, 'Juan', 'López', '1053000000']
    );
    
    await dataSource.query(
      `INSERT INTO accounts (id, user_id, balance, currency) VALUES ($1, $2, $3, $4)`,
      [accountId, userId, '500000.00', 'COP']
    );
    
  });
  
  it('should process a deposit and update balance', async () => {
    
    const transaction = {
      transaction_id: '678d304b-19ae-4efe-953e-0ea203793a40',
      user_id: userId,
      account_id: accountId,
      amount: 150000.00,
      type: 'deposit',
      timestamp: new Date().toISOString()
    };
    
    const transactionResponse = await request(app.getHttpServer()).post('/api/transactions').send(transaction).expect(201);
    expect(transactionResponse.body.success).toBe(true);
    expect(transactionResponse.body.transaction).toBeDefined();
    
    const balanceResponse = await request(app.getHttpServer()).get(`/api/users/${userId}/balance`).expect(200);
    expect(balanceResponse.body.balance).toBeDefined();
    
  });
  
  it('should create fraud alert when many large txs happen', async () => {
    
    const transaction1 = {
      transaction_id: '93183f4d-c170-4766-bc27-e4bbcd77ad86',
      user_id: userId,
      account_id: accountId,
      amount: 200000.00,
      type: 'deposit',
      timestamp: new Date().toISOString()
    };
    
    const transaction2 = {
      transaction_id: '0ffb9fb7-636b-4f01-8118-e991fa25b887',
      user_id: userId,
      account_id: accountId,
      amount: 300000.00,
      type: 'deposit',
      timestamp: new Date().toISOString()
    };
    
    await request(app.getHttpServer()).post('/api/transactions').send(transaction1).expect(201);
    await request(app.getHttpServer()).post('/api/transactions').send(transaction2).expect(201);
    
    const rows = await dataSource.query(`SELECT * FROM fraud_alerts WHERE user_id = $1`, [userId]);
    expect(rows.length).toBeGreaterThanOrEqual(1);
    
  });
  
});
