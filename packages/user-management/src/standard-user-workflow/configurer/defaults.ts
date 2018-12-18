import { ConfigurationProperties, ZetaPushContext } from '@zetapush/core';
import { trace, CURRENT_WORKER_NAME } from '@zetapush/common';
import {
  RegistrationConfirmationPropertyKeys,
  ResetPasswordPropertiesKeys,
  EmailPropertyKeys,
  ProductPropertyKeys,
  MailjetPropertyKey,
  SmtpPropertyKey
} from './properties';
import { Token } from '../../common/api';
import { Account, AccountConfirmationTemplateVariables, AccountResetPasswordTemplateVariables } from '../api';
import { AccountConfirmationContext } from '../api/Confirmation';
import { ResetPasswordContext } from '../api/LostPassword';
import path from 'path';

export const DEFAULT_APPLICATION_NAME = (properties: ConfigurationProperties) => {
  return properties.get(ProductPropertyKeys.ProductName);
};

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
  if (account.profile.email) {
    return `${account.profile.email}`;
  }
  return '';
};

export const DEFAULT_CONFIRMATION_URL = async ({
  properties,
  zetapushContext,
  account,
  token
}: AccountConfirmationContext) => {
  const url = `${properties.get(
    RegistrationConfirmationPropertyKeys.BaseUrl,
    zetapushContext.getWorkerUrl(CURRENT_WORKER_NAME, true)
  )}/users/${account.accountId}/confirm/${token.value}`;
  trace('confirmation url', url);
  return url;
};

export const DEFAULT_CONFIRMATION_HTML_TEMPLATE = ({
  account,
  confirmationUrl,
  properties
}: AccountConfirmationTemplateVariables) =>
  `<h1>Welcome ${DEFAULT_USERNAME(account)}!</h1>

<p>
Thank you for signing up${DEFAULT_APPLICATION_NAME(properties) ? ' for ' + DEFAULT_APPLICATION_NAME(properties) : ''}!
</p>

<p>
Please verify your email address by clicking the button below.
</p>
<table border="0" cellpadding="0" cellspacing="0" width="335" style="border-spacing:0;border-collapse:separate;table-layout:auto;width:335px;padding:0">
  <tbody><tr style="padding:0">
    <td align="center" valign="middle" style="word-break:break-word;border-collapse:collapse!important;border-radius:35px;padding:20px 25px" bgcolor="#00c9c9">
      <a href="${confirmationUrl}" style="color:#fff!important;text-decoration:none;display:block;font-size:23px;">Confirm my account</a>
    </td>
  </tr>
</tbody>
</table>
<p>
If you didn't request this, please ignore this email.
</p>`;

export const DEFAULT_CONFIRMATION_TEXT_TEMPLATE = ({
  account,
  confirmationUrl,
  properties
}: AccountConfirmationTemplateVariables) => {
  `Welcome ${DEFAULT_USERNAME(account)}! 

Thank you for signing up${DEFAULT_APPLICATION_NAME(properties) ? ' for ' + DEFAULT_APPLICATION_NAME(properties) : ''}!

Please verify your email address by clicking the link below.
${confirmationUrl}

If you didn't request this, please ignore this email.`;
};

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

/**
 * Rest password by email properties
 */
export const DEFAULT_ASK_RESET_PASSWORD_SENDER = (properties: ConfigurationProperties) =>
  properties.get(
    ResetPasswordPropertiesKeys.EmailFrom,
    properties.get(
      EmailPropertyKeys.From,
      `no-reply@${properties.get(ProductPropertyKeys.OrganizationName, 'zetapush')}.com`
    )
  );

export const DEFAULT_ASK_RESET_PASSWORD_SUBJECT = (properties: ConfigurationProperties) =>
  properties.get(ResetPasswordPropertiesKeys.EmailSubject, `Reset your password`);

export const DEFAULT_ASK_RESET_PASSWORD_HTML_TEMPLATE = ({
  account,
  askResetPasswordUrl
}: AccountResetPasswordTemplateVariables) =>
  `Hello ${DEFAULT_USERNAME(account)}, 
  
  <a href="${askResetPasswordUrl}">Please choose a new password</a>`;

export const DEFAULT_ASK_RESET_PASSWORD_TEXT_TEMPLATE = ({
  account,
  askResetPasswordUrl
}: AccountResetPasswordTemplateVariables) =>
  `Hello ${DEFAULT_USERNAME(account)}, 
  
  Please choose a new password: ${askResetPasswordUrl}`;

export const DEFAULT_ASK_RESET_PASSWORD_URL = async ({
  account,
  token,
  properties,
  zetapushContext
}: ResetPasswordContext) => {
  const url = `${properties.get(
    ResetPasswordPropertiesKeys.BaseUrl,
    zetapushContext.getFrontUrl()
  )}#ask-reset-password/${token.value}`;
  trace('reset password url', url);
  return url;
};
