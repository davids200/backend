export interface OtpRequestedEvent {

  type:
    'email' | 'phone';

  value: string;
}