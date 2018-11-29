import { ResetPasswordUrlProvider, ResetPasswordContext } from '../../api/LostPassword';

export class FuncResetPasswordUrlProvider implements ResetPasswordUrlProvider {
  constructor(private func: (context: ResetPasswordContext) => Promise<string>) {}

  async getUrl(context: ResetPasswordContext): Promise<string> {
    return await this.func(context);
  }
}
