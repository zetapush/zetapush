import { Email } from '../Email';

export abstract class MessageError extends Error {}

export class EmailError extends MessageError {
  constructor(message: string, public email: Email, public cause?: Error) {
    super(message);
  }
}
