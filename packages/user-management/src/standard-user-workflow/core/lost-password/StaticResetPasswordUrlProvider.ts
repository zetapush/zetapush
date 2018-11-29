import { ResetPasswordUrlProvider, ResetPasswordContext } from '../../api/LostPassword';

export class StaticResetPasswordUrlProvider implements ResetPasswordUrlProvider {
  constructor(private url: string) {}

  async getUrl(context: ResetPasswordContext): Promise<string> {
    return this.url;
  }
}
