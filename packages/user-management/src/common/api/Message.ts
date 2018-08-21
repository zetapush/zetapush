/**
 * ================================
 * Message Managers
 * ================================
 */
export interface MessageSender {
  send(message: Message): Promise<SentMessage>;
}

export abstract class MessageSenderInjectable implements MessageSender {
  abstract send(message: Message): Promise<SentMessage>;
}

/**
 * ================================
 * Utils types / interfaces
 * ================================
 */

/**
 * Just a marker interface
 */
export interface Message {}

export interface Recipient {}

export interface Sender {}

export interface Content {}

export interface SentMessage {
  message: Message;
}
