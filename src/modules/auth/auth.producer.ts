import {  Injectable,} from '@nestjs/common';
import { KafkaService }from '../../infrastructure/kafka/kafka.service'; 
import { OtpRequestedEvent } from '../../common/constants/contracts/events/otp-requested.event';
import { SuspiciousLoginEvent } from '../../common/constants/contracts/events/suspicious-login.event';

@Injectable()
export class AuthProducer {
  constructor(
    private readonly kafka:
      KafkaService,
  ) {}

  
  // USER REGISTERED
  
  async userRegistered(data: {userId: string;}) {
    await this.kafka.emit('auth.user.registered',data,data.userId,
    );
  }

  
  // USER LOGGED IN
  async userLoggedIn(data: {    userId: string;  }) {
    await this.kafka.emit(
      'auth.user.logged_in',
      data,
      data.userId,
    );
  }


  
  // OTP REQUESTED  
  async otpRequested(data: OtpRequestedEvent,) {
    await this.kafka.emit('auth.otp.requested',data,data.value,);
  }




async suspiciousLogin(data: SuspiciousLoginEvent,) {
  await this.kafka.emit('auth.suspicious.login',data,data.userId,);
}



}