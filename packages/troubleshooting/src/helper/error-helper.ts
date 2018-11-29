// NodeJS modules
import { setImmediate } from 'timers';
// Project modules
import { ErrorAnalyzerResult, ExitCode } from '../analyzer/error-analyzer';

export class ErrorHelper {
  public refresh: boolean;
  constructor(refresh = false) {
    this.refresh = refresh;
  }
  getMessages(): Promise<ExitCode[]> {
    return Promise.resolve([]);
  }
  getHelp(code: ErrorAnalyzerResult): Promise<string> {
    return Promise.resolve('');
  }
  private static instance: ErrorHelper | null = null;
  static getInstance(factory?: () => ErrorHelper) {
    if (ErrorHelper.instance === null && factory) {
      ErrorHelper.instance = factory();
    }
    const instance = ErrorHelper.instance;

    setImmediate(() => {
      if (ErrorHelper.instance !== null) {
        ErrorHelper.instance.getMessages();
      }
    });
    return instance;
  }
}
