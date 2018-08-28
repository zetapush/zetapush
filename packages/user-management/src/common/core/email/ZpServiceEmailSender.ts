import { Sender, MessageSender, Message, SentMessage } from '../../api';

export class ZpServiceEmailSender implements MessageSender {
  async send(message: Message): Promise<SentMessage> {
    throw 'Not implemented';
  }
}
