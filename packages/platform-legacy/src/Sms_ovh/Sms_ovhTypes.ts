export interface SmsMessage {
  /**Sender name*/
  sender?: string;
  /**Text message. Standard restrictions for text messages apply*/
  message?: string;
  /**List of recipients*/
  receivers?: string[];
}
