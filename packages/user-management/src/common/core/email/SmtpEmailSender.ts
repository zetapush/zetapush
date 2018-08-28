import { Sender, MessageSender, Message, SentMessage } from '../../api';

export class SmtpEmailSender implements MessageSender {
  async send(message: Message): Promise<SentMessage> {
    throw 'Not implemented';
  }
}
