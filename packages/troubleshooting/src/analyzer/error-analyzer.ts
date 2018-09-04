import { ExitCode } from '../utils/constants';

export { ExitCode };

export interface ErrorAnalyzerResult {
  code: ExitCode;
  [property: string]: any;
}

export type ErrorContextToAnalyze = any;

export class ErrorAnalyzer {
  private static analyzers: ErrorAnalyzer[] = [];

  static register(analyzer: ErrorAnalyzer) {
    ErrorAnalyzer.analyzers.push(analyzer);
  }

  static async analyze(context: ErrorContextToAnalyze) {
    for (let analyzer of ErrorAnalyzer.analyzers) {
      const code = await analyzer.getError(context);
      if (code) {
        return code;
      }
    }
    return null;
  }
  getError(context: ErrorContextToAnalyze): Promise<ErrorAnalyzerResult | null> {
    return Promise.resolve(null);
  }
}
