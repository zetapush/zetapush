// NodeJS modules
import { URL } from 'url';
// ZetaPush modules
import { error, trace } from '@zetapush/common';
// Project modules
import { ErrorAnalyzerResult, ExitCode } from '../analyzer/error-analyzer';
import { ErrorHelper } from './error-helper';
import { download } from '../utils/download';
import { DOC_BASE_URL, DOC_SOURCE_BASE_URL } from '../utils/constants';
import { parse } from '../utils/asciidoc-parser';

export class HttpDownloadErrorHelper extends ErrorHelper {
  async getMessages(): Promise<ExitCode[]> {
    const codes = await download(new URL(`${DOC_BASE_URL}/common/troubleshooting/error-codes.json`));
    return codes as ExitCode[];
  }
  async getHelp(err: ErrorAnalyzerResult) {
    try {
      const url = new URL(`${DOC_SOURCE_BASE_URL}/src/docs/asciidoc/common/troubleshooting/${err.code}.adoc`);
      trace(`Downloading ${url}`);
      const body = await download(url);
      let textContent = body;
      textContent = parse(textContent);
      textContent = await this.loadTextSchemas(textContent);
      return textContent;
    } catch (e) {
      error(`Failed to download help for error ${err.code}. Please visit
        ${DOC_BASE_URL}/common/help/${err.code}.html`);
      trace('download error', e);
      throw e;
    }
  }
  async loadTextSchemas(content: string) {
    const schemaUrls: any[] = [];
    let newContent = content.replace(
      /\+\+\+\+\ninclude::\{docdir\\?\}\/(.+)(\.[^.]+)\[\]\n\+\+\+\+/g,
      (_, path, ext) => {
        let imgUrl = new URL(`${DOC_SOURCE_BASE_URL}/src/docs/asciidoc/${path}${ext}`);
        let textUrl = new URL(`${DOC_SOURCE_BASE_URL}/src/docs/asciidoc/${path}.txt`);
        schemaUrls.push({ image: imgUrl, text: textUrl });
        return textUrl.toString();
      }
    );
    for (let schemaUrl of schemaUrls) {
      try {
        newContent = newContent.replace(schemaUrl.text, await download(schemaUrl.text));
      } catch (e) {
        newContent = newContent.replace(schemaUrl.text, `Schema is available at ${schemaUrl.image}`);
      }
    }
    return newContent;
  }
}
