import { Module } from '@zetapush/core';
import { StandardUserManagementModule, StandardUserWorkflow, ConfirmationUrlHttpHandler, MessageSender, Message, SentMessage, EmailSenderInjectable } from '@zetapush/user-management';

// export class MyEmailSender implements MessageSender {

//   async send(message: Message): Promise<SentMessage>  {
//     console.log('Message : ', message);
//     return { message };
//   }
// }

@Module({
  imports: [StandardUserManagementModule],
  expose: {
    user: StandardUserWorkflow,
    http: ConfirmationUrlHttpHandler
  },
  // providers: [ {
  //   provide: EmailSenderInjectable,
  //   useClass: MyEmailSender
  // }]
})
export default class Api {}
















































// @Module({
//   imports: [StandardUserManagementModule],
//   expose: {
//     user: StandardUserWorkflow,
//     http: ConfirmationUrlHttpHandler
//   },
//   provide: [{provide: EmailSenderInjectable, MySender}]
// })
// export default class Api {}

// class MySender implements MessageSender {

// }
// export class MyConfigurer extends DefaultStandardUserWorkflowConfigurer {
//   configure(env: Environment) {
//     const default = super.configure();
//     default.confirmation().email().sender(new MySender());
//   }
// }
