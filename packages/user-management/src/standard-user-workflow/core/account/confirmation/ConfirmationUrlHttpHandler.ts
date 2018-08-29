import { ConfirmationUrlProvider } from '../../../api/Confirmation';
import { StandardUserWorkflow } from '../../StandardUserWorkflow';
import { RedirectionProvider, ConfirmedAccount, HttpUrlRedirection } from '../../../api';
import { HttpServer, Request, Response } from '@zetapush/http-server';
import { debugObject } from '@zetapush/common';

// @Controller()
// export class ConfirmationUrlHttpHandler {
//   constructor(private standardUserWorkflow: StandardUserWorkflow) {
//     // registry.addRoute(HttpMethod.GET, '/users/:accountId/confirm/:token', this.confirm.bind(this));
//   }

//   @Get('/users/:accountId/confirm/:token')
//   async confirm(@PathVariable('accountId') accountId: string, @PathVariable('token') token: string) {
//     const redirection = await this.standardUserWorkflow.confirm({
//       createdAccount: { accountId },
//       token: { value: token }
//     });
//     return redirectTo(redirection);
//   }
// }

export class ConfirmationUrlHttpHandler {
  constructor(private standardUserWorkflow: StandardUserWorkflow, app: HttpServer) {
    debugObject('ConfirmationUrlHttpHandler', { foo: 'foo' });
    app.get('/users/:accountId/confirm/:token', this.confirm.bind(this));
  }

  async confirm(req: Request, res: Response) {
    debugObject('ConfirmationUrlHttpHandler-confirm', req, res);
    const accountId = req.params.accountId;
    const token = req.params.token;
    debugObject('ConfirmationUrlHttpHandler-confirm-2', accountId, token);
    const redirection = await this.standardUserWorkflow.confirm({
      createdAccount: { accountId },
      token: { value: token }
    });
    debugObject('ConfirmationUrlHttpHandler-confirm-redirection', redirection);
    // TODO: check if it is a redirection or an action
    const r = redirection as HttpUrlRedirection;
    return res.redirect(r.statusCode, r.url);
  }
}
