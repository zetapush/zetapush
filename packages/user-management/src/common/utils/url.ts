import { URL } from 'url';

import { BaseError } from '@zetapush/common';
const path = require('path');

export abstract class UrlError extends BaseError {
  constructor(
    message: string,
    public readonly fragmentName: string,
    public readonly configurationKey: string,
    cause?: Error
  ) {
    super(message, cause);
  }
}

export class DefaultRelativeUrlError extends UrlError {
  constructor(message: string, fragmentName: string, configurationKey: string, cause?: Error) {
    super(message, fragmentName, configurationKey, cause);
  }
}

export class MissingBaseUrlError extends UrlError {
  constructor(message: string, fragmentName: string, configurationKey: string, cause?: Error) {
    super(message, fragmentName, configurationKey, cause);
  }
}

export class InvalidUrlError extends UrlError {
  constructor(message: string, fragmentName: string, configurationKey: string, cause?: Error) {
    super(message, fragmentName, configurationKey, cause);
  }
}

export const absolutize = (
  url: string | null,
  baseUrl: string | null,
  defaultPath: string,
  what: string,
  configurationKey: string
): string => {
  let relativeUrl = url;
  if (relativeUrl === null) {
    relativeUrl = defaultPath;
  }
  // no matching front/worker handled by ZetaPush
  // and no explicit URL configured (using default path)
  if (!baseUrl && relativeUrl === defaultPath) {
    throw new DefaultRelativeUrlError(
      `You didn't provide any URL for ${configurationKey}, so the default relative path is used (${defaultPath}).
    It seems that there is no ${what} started. Mechanism that automatically provides URLs can't provide valid URL for ${what}.

    You need to either start ${what} or to provide an explicit and absolute URL for ${configurationKey}`,
      what,
      configurationKey
    );
  }
  try {
    let absoluteUrl = join(relativeUrl, baseUrl || undefined);
    return absoluteUrl.toString();
  } catch (e) {
    // not a valid URL, maybe because it is relative
    // and no matching front/worker handled by ZetaPush
    // => still relative at the end so it is not valid
    if (baseUrl === null || baseUrl === '') {
      throw new MissingBaseUrlError(
        `It seems that there is no ${what} started. Mechanism that automatically provides URLs can't provide valid URL for ${what}.

      You need to either start ${what} or to provide an explicit and absolute URL for ${configurationKey}`,
        what,
        configurationKey,
        e
      );
    }
    throw new InvalidUrlError(
      `The URL for ${configurationKey} provided in configuration is not valid`,
      what,
      configurationKey,
      e
    );
  }
};

export const join = (url: string, baseUrl?: string) => {
  if (isAbsolute(url)) {
    return new URL(url).toString();
  }
  return new URL(path.join(baseUrl || '', url)).toString();
};

export const isAbsolute = (url: string) => {
  return /^(?:[a-z]+:)?\/\//i.test(url);
};
