/**
 * ================================
 * Message Managers
 * ================================
 */
export interface MessageSender {
  send(message: Message): SentMessage;
}

/**
 * ================================
 * Utils types / interfaces
 * ================================
 */
export interface Message {
  to: MessageTarget;
  body?: MessageBody;
  subject?: MessageSubject;
}

export interface MessageTarget {}

export interface MessageBody {}

export interface MessageSubject {}

export interface SentMessage extends Message {}
