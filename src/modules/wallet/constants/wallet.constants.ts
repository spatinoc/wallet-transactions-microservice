import { Injectable } from '@nestjs/common';

@Injectable()
export default class WalletConstants {
  
  public static get FRAUD_THRESHOLD() {
    return parseFloat(process.env.FRAUD_THRESHOLD || '100000');
  }
  
  public static get FRAUD_WINDOW_MINUTES() {
    return parseInt(process.env.FRAUD_WINDOW_MINUTES || '5');
  }
  
  public static get FRAUD_COUNT() {
    return parseInt(process.env.FRAUD_COUNT || '3');
  }
  
}
