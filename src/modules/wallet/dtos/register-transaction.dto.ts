import { IsUUID, IsNumber, IsIn, IsDateString, IsString, IsNotEmpty, IsPositive } from 'class-validator';

export class RegisterTransactionDto {
  
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  transaction_id: string;
  
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  user_id: string;
  
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  account_id: string;
  
  @IsNotEmpty()
  @IsNumber(
    {maxDecimalPlaces: 2},
    {message: 'Amount must be a number with up to 2 decimals'},
  )
  @IsPositive({message: 'Amount must be greater than zero'})
  amount: number;
  
  @IsNotEmpty()
  @IsIn(['deposit', 'withdraw'])
  type: 'deposit' | 'withdraw';
  
  @IsNotEmpty()
  @IsDateString()
  timestamp: string;
  
}
