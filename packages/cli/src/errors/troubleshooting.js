const { trace, log, error, info, help, warn } = require('../utils/log');
const { parse } = require('./asciidoc-parser');
const chalk = require('chalk');
const chalkTpl = require('chalk/templates');
const request = require('request');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const process = require('process');
const os = require('os');
const ora = require('ora');

const DOC_BASE_URL =
  process.env.ZP_DOC_BASE_URL || 'https://zetapush.github.io/documentation';
const DOC_SOURCE_BASE_URL =
  process.env.ZP_DOC_SOURCE_BASE_URL ||
  'https://github.com/zetapush/documentation/tree/master';
const HELP_CACHE_EXPIRATION =
  process.env.ZP_HELP_CACHE_EXPIRATION || 7 * 24 * 60 * 60 * 1000;

class ErrorAnalyzer {
  getError(errorCtx) {
    return '';
  }

  static register(analyzer) {
    if (!ErrorAnalyzer.analyzers) {
      ErrorAnalyzer.analyzers = [];
    }
    ErrorAnalyzer.analyzers.push(analyzer);
  }

  static async analyze(errorCtx) {
    for (let analyzer of ErrorAnalyzer.analyzers) {
      let errorCode = await analyzer.getError(errorCtx);
      if (errorCode) {
        return errorCode;
      }
    }
    return null;
  }
}

class ErrorHelper {
  getMessages() {
    return Promise.resolve([]);
  }
  getHelp(code) {
    return Promise.resolve('');
  }
}

const download = (url) => {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {},
      method: 'GET',
      url,
    };
    request(options, (failure, response, body) => {
      if (failure || response.statusCode >= 400) {
        reject({ failure, response });
      }
      resolve(body);
    });
  });
};

class HttpDownloadErrorHelper extends ErrorHelper {
  async getMessages() {
    return await download(
      new URL(`${DOC_BASE_URL}/common/troubleshooting/error-codes.json`),
    );
  }
  async getHelp(err) {
    try {
      const body = await download(
        new URL(
          `${DOC_SOURCE_BASE_URL}/src/docs/asciidoc/common/troubleshooting/${
            err.code
          }.adoc`,
        ),
      );
      let textContent = body;
      textContent = parse(textContent);
      textContent = await this.loadTextSchemas(textContent);
      return textContent;
    } catch (e) {
      error(`Failed to download help for error ${err.code}. Please visit
        ${DOC_BASE_URL}/common/help/${err.code}.html`);
      trace(e);
      throw e;
    }
  }
  async loadTextSchemas(content) {
    const schemaUrls = [];
    let newContent = content.replace(
      /\+\+\+\+\ninclude::\{docdir\\?\}\/(.+)(\.[^.]+)\[\]\n\+\+\+\+/g,
      function(_, path, ext) {
        let imgUrl = new URL(
          `${DOC_SOURCE_BASE_URL}/src/docs/asciidoc/${path}${ext}`,
        );
        let textUrl = new URL(
          `${DOC_SOURCE_BASE_URL}/src/docs/asciidoc/${path}.txt`,
        );
        schemaUrls.push({ image: imgUrl, text: textUrl });
        return textUrl;
      },
    );
    for (let schemaUrl of schemaUrls) {
      try {
        newContent = newContent.replace(
          schemaUrl.text,
          await download(schemaUrl.text),
        );
      } catch (e) {
        newContent = newContent.replace(
          schemaUrl.text,
          `Schema is available at ${schemaUrl.image}`,
        );
      }
    }
    return newContent;
  }
}

class CacheErrorHelper extends ErrorHelper {
  constructor(delegate, refresh) {
    super();
    this.delegate = delegate;
    this.refresh = refresh;
  }
  async getMessages() {
    try {
      if (
        !this.refresh &&
        !this.isExpired() &&
        fs.existsSync(this.getCachedFile('error-codes.json'))
      ) {
        trace(`Use cached troubleshoot codes`);
        return fs
          .readFileSync(this.getCachedFile('error-codes.json'))
          .toString();
      }
      trace(`Download each troubleshoot help and cache them`);
      const errorCodesStr = await this.delegate.getMessages();
      fs.writeFileSync(this.getCachedFile('error-codes.json'), errorCodesStr);
      const errorCodes = JSON.parse(errorCodesStr);
      for (let errorCode of errorCodes) {
        let content = await this.delegate.getHelp({ code: errorCode });
        fs.writeFileSync(this.getCachedFile(errorCode), content);
      }
      fs.writeFileSync(
        this.getCachedFile('.last-update'),
        new Date().valueOf(),
      );
      return errorCodes;
    } catch (e) {
      trace(e);
      return [];
    }
  }
  async getHelp(err) {
    try {
      if (
        !this.refresh &&
        !this.isExpired() &&
        fs.existsSync(this.getCachedFile(err.code))
      ) {
        trace(`Use cached troubleshoot for ${err.code}`);
        return fs.readFileSync(this.getCachedFile(err.code)).toString();
      }
      trace(`Download troubleshoot for ${err.code} and cache it`);
      let content = await this.delegate.getHelp({ code: err.code });
      fs.writeFileSync(this.getCachedFile(err.code), content);
      return content;
    } catch (e) {
      trace(e);
      throw e;
    }
  }
  getCachedFile(file) {
    const p = path.normalize(path.resolve(os.homedir(), '.zeta', 'cache', file))
    mkdirs(p)
    return p;
  }
  isExpired() {
    const lastUpdateFile = this.getCachedFile('.last-update');
    const lastUpdate =
      (fs.existsSync(lastUpdateFile) && fs.readFileSync(lastUpdateFile)) || 0;
    let expired =
      new Date().valueOf() > parseInt(lastUpdate) + HELP_CACHE_EXPIRATION;
    trace(`Cache expired=${expired}`);
    return expired;
  }
}

const evaluate = (message, err) => {
  return message.replace(/\$\{([^}]+)\}/g, (_, variable) => {
    let value = err;
    for (let part of variable.split('.')) {
      value = value[part];
      if (!value) {
        break;
      }
    }
    return value;
  });
};

const mkdirs = (file) => {
  let dirs = [];
  for (let dir of path.parse(file).dir.split(path.sep)) {
    dirs.push(dir);
    let dirPath = dirs.join(path.sep)
    if(dirPath) {
      fs.existsSync(dirPath) || fs.mkdirSync(dirPath);
    }
  }
}

// Fill cache if necessary
const errorHelper = new CacheErrorHelper(new HttpDownloadErrorHelper(), false);
errorHelper.getMessages();

const displayHelp = async (errorCtxt) => {
  const spinner = ora('Analyzing the error to provide you useful help... \n');
  try {
    spinner.start();
    let analyzedError = await ErrorAnalyzer.analyze(errorCtxt);
    spinner.stop();
    if (analyzedError) {
      trace(
        `Analyze done => errorCode=${
          analyzedError.code
        }. Displaying help for this code`,
      );
      await displayHelpMessage(analyzedError);
      // FIXME: remove noise from npm
      process.exit(EXIT_CODES[analyzedError.code] || 254)
      // process.exit(0);
    } else {
      info("No help available")
      error(errorCtxt)
      process.exit(253)
    }
  } catch (e) {
    spinner.stop();
    warn("Failed to analyze error to provide useful help. Please report bug", e);
  }
};

const displayHelpMessage = async (error) => {
  try {
    trace(`Display help message for ${error.code}`);
    let helpMessage = await errorHelper.getHelp(error);
    help(chalkTpl(chalk, evaluate(helpMessage, error)));
  } catch (e) {
    warn("Failed to display help message. Please report bug", e);
  }
};

const EXIT_CODES = {
  'CONFIG-01': 1,
  'NET-01': 11,
  'NET-02': 12,
  'NET-03': 13,
  'NET-04': 14,
  'DEPENDENCY-01': 31,
  'DEPENDENCY-02': 32,
  'ACCOUNT-01': 51,
  'ACCOUNT-02': 52,
  'ACCOUNT-03': 53,
  'ACCOUNT-04': 54,
  'ACCOUNT-05': 55,
  'ACCOUNT-06': 56,
  'INJECTION-01': 71,
  'SERVICE-04': 94,
  'SERVICE-05': 95,
};

module.exports = {
  ErrorAnalyzer,
  displayHelp,
  displayHelpMessage,
  errorHelper,
};
