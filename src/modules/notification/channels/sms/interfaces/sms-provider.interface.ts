export interface SmsProvider {

  sendOtp(params: {
    phone: string;
    otp: string;
  }): Promise<void>;
}