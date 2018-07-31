// NodeJS modules
import fs from 'fs';
// ZetaPush modules
import { getZetaFilePath, trace } from '@zetapush/common';
// Project modules
import { ErrorHelper } from './error-helper';
import { HELP_CACHE_EXPIRATION } from '../utils/constants';
import { ErrorAnalyzerResult, ExitCode } from '../analyzer/error-analyzer';

export class CacheErrorHelper extends ErrorHelper {
  private delegate: ErrorHelper;
  constructor(delegate: ErrorHelper, refresh: boolean) {
    super(refresh);
    this.delegate = delegate;
  }
  async getMessages() {
    try {
      if (!this.refresh && !this.isExpired() && fs.existsSync(this.getCachedFile('error-codes.json'))) {
        trace(`Use cached troubleshoot codes`);
        const errorCodes = fs.readFileSync(this.getCachedFile('error-codes.json')).toString();
        return JSON.parse(errorCodes) as ExitCode[];
      }
      trace(`Download each troubleshoot help and cache them`);
      const errorCodes = await this.delegate.getMessages();
      fs.writeFileSync(this.getCachedFile('error-codes.json'), JSON.stringify(errorCodes));
      for (let errorCode of errorCodes) {
        let content = await this.delegate.getHelp({ code: errorCode });
        fs.writeFileSync(this.getCachedFile(errorCode), content);
      }
      fs.writeFileSync(this.getCachedFile('.last-update'), new Date().valueOf());
      return errorCodes;
    } catch (e) {
      trace('cache error', e);
      return [];
    }
  }
  async getHelp(err: ErrorAnalyzerResult) {
    try {
      if (!this.refresh && !this.isExpired() && fs.existsSync(this.getCachedFile(err.code))) {
        trace(`Use cached troubleshoot for ${err.code}`);
        return fs.readFileSync(this.getCachedFile(err.code)).toString();
      }
      trace(`Download troubleshoot for ${err.code} and cache it`);
      let content = await this.delegate.getHelp({ code: err.code });
      fs.writeFileSync(this.getCachedFile(err.code), content);
      return content;
    } catch (e) {
      trace('get help error', e);
      throw e;
    }
  }
  private getCachedFile(file: string) {
    return getZetaFilePath('cache', file);
  }
  private isExpired() {
    const lastUpdateFile = this.getCachedFile('.last-update');
    const lastUpdate = (fs.existsSync(lastUpdateFile) && parseInt(fs.readFileSync(lastUpdateFile).toString(), 10)) || 0;
    let expired = new Date().valueOf() > lastUpdate + HELP_CACHE_EXPIRATION;
    trace(`Cache expired=${expired}`);
    return expired;
  }
}
