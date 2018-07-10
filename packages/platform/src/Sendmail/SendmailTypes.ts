export interface Email {
  /**Email recipients*/
  to?: string[];
  /**Email html body. you can use text and/or html*/
  html?: string;
  /**Email recipients*/
  cc?: string[];
  /**Email recipients*/
  bcc?: string[];
  /**Email subject*/
  subject: string;
  /**Email plain text body*/
  text?: string;
}
