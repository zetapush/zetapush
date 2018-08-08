import { Sendmail, Options } from '@zetapush/platform-legacy';

@Options({
  sendmail_username: 'abb13e7529f0bb01e9768a8068017556',
  sendmail_password: 'b84b601427442843f67a8a91b2c183bd',
  sendmail_host: 'in-v3.mailjet.com',
  sendmail_port: 465,
  sendmail_from: 'root@zetapush.com',
  sendmail_replyTo: 'root@zetapush.com',
  sendmail_ssl: true,
  sendmail_starttls: false
})
export class ConfiguredSendmailApi extends Sendmail {

}