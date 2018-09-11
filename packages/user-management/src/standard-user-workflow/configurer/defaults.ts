import { ConfigurationProperties, ZetaPushContext } from '@zetapush/core';
import { trace } from '@zetapush/common';
import {
  RegistrationConfirmationPropertyKeys,
  EmailPropertyKeys,
  ProductPropertyKeys,
  MailjetPropertyKey,
  SmtpPropertyKey
} from './properties';
import { Token } from '../../common/api';
import { Account, AccountConfirmationTemplateVariables } from '../api';
import { AccountConfirmationContext } from '../api/Confirmation';

// TODO: general provider
export const DEFAULT_USERNAME = (account: Account) => {
  if (account.profile.login) {
    return account.profile.login;
  }
  if (account.profile.username) {
    return account.profile.username;
  }
  if (account.profile.firstname && account.profile.lastname) {
    return `${account.profile.firstname} ${account.profile.lastname}`;
  }
  return 'you';
};

export const DEFAULT_CONFIRMATION_URL = async ({
  properties,
  zetapushContext,
  account,
  token
}: AccountConfirmationContext) => {
  const url = `${properties.get(RegistrationConfirmationPropertyKeys.BaseUrl, zetapushContext.getWorkerUrl())}/users/${
    account.accountId
  }/confirm/${token.value}`;
  trace('confirmation url', url);
  return url;
};

export const DEFAULT_CONFIRMATION_HTML_TEMPLATE = ({
  account,
  confirmationUrl
}: AccountConfirmationTemplateVariables) =>
  `Hello ${DEFAULT_USERNAME(account)}, 

<a href="${confirmationUrl}">Please confirm your account</a>`;

export const DEFAULT_CONFIRMATION_TEXT_TEMPLATE = ({
  account,
  confirmationUrl
}: AccountConfirmationTemplateVariables) =>
  `Hello ${DEFAULT_USERNAME(account)}, 

Please confirm your account: ${confirmationUrl}`;

export const DEFAULT_CONFIRMATION_SUBJECT = (properties: ConfigurationProperties) =>
  properties.get(RegistrationConfirmationPropertyKeys.EmailSubject, `Confirm your inscription`);

export const DEFAULT_CONFIRMATION_SENDER = (properties: ConfigurationProperties) =>
  properties.get(
    RegistrationConfirmationPropertyKeys.EmailFrom,
    properties.get(
      EmailPropertyKeys.From,
      `no-reply@${properties.get(ProductPropertyKeys.OrganizationName, 'zetapush')}.com`
    )
  );

export const DEFAULT_CONFIRMATION_TOKEN_VALIDITY = 60 * 60 * 1000;

export const DEFAULT_MAILJET_ENABLE = (properties: ConfigurationProperties) =>
  properties.get(MailjetPropertyKey.Enable, true) &&
  properties.has(MailjetPropertyKey.ApiKeyPublic) &&
  properties.has(MailjetPropertyKey.ApiKeyPrivate);

export const DEFAULT_MAILJET_URL = (properties: ConfigurationProperties) =>
  properties.get(MailjetPropertyKey.Url, 'https://api.mailjet.com/v3.1/send');

export const DEFAULT_MAILJET_API_KEY_PUBLIC = (properties: ConfigurationProperties): string =>
  properties.get(MailjetPropertyKey.ApiKeyPublic, '');

export const DEFAULT_MAILJET_API_KEY_PRIVATE = (properties: ConfigurationProperties): string =>
  properties.get(MailjetPropertyKey.ApiKeyPrivate, '');

export const DEFAULT_CONFIRMATION_SUCCESS_REDIRECTION = (
  properties: ConfigurationProperties,
  zetapushContext: ZetaPushContext
): string =>
  properties.get(
    RegistrationConfirmationPropertyKeys.AccountConfirmedRedirectionUrl,
    `${zetapushContext.getFrontUrl()}#account-confirmed`
  );

export const DEFAULT_CONFIRMATION_FAILURE_REDIRECTION = (
  properties: ConfigurationProperties,
  zetapushContext: ZetaPushContext
): string =>
  properties.get(
    RegistrationConfirmationPropertyKeys.AccountConfirmationFailedRedirectionUrl,
    `${zetapushContext.getFrontUrl()}#account-confirmation-error`
  );

export const DEFAULT_SMTP_ENABLE = (properties: ConfigurationProperties) =>
  properties.get(SmtpPropertyKey.Enable, true) && properties.has(SmtpPropertyKey.Host);

export const DEFAULT_SMTP_HOST = (properties: ConfigurationProperties): string =>
  properties.get(SmtpPropertyKey.Host, '');

export const DEFAULT_SMTP_PORT = (properties: ConfigurationProperties): number =>
  properties.get(SmtpPropertyKey.Port, 465);

export const DEFAULT_SMTP_USERNAME = (properties: ConfigurationProperties): string =>
  properties.get(SmtpPropertyKey.Username, '');

export const DEFAULT_SMTP_PASSWORD = (properties: ConfigurationProperties): string =>
  properties.get(SmtpPropertyKey.Password, '');

export const DEFAULT_SMTP_SSL = (properties: ConfigurationProperties): boolean =>
  properties.get(SmtpPropertyKey.UseSsl, true);

export const DEFAULT_SMTP_STARTTLS = (properties: ConfigurationProperties): boolean =>
  properties.get(SmtpPropertyKey.StartTls, true);
