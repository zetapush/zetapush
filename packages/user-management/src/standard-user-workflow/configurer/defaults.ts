import { ConfigurationProperties, ZetaPushContext } from '@zetapush/core';
import {
  RegistrationConfirmationPropertyKeys,
  EmailPropertyKeys,
  ProductPropertyKeys,
  MailjetPropertyKey
} from './properties';
import { Token } from '../../common/api';
import { Account, AccountConfirmationTemplateVariables } from '../api';
import { AccountConfirmationContext } from '../api/Confirmation';

export const DEFAULT_CONFIRMATION_URL = async ({
  properties,
  zetapushContext,
  account,
  token
}: AccountConfirmationContext) =>
  `${properties.get(RegistrationConfirmationPropertyKeys.BaseUrl, zetapushContext.getWorkerUrl())}/${
    account.accountId
  }/confirm/${token.value}`;

export const DEFAULT_CONFIRMATION_HTML_TEMPLATE = ({
  account,
  confirmationUrl
}: AccountConfirmationTemplateVariables) =>
  `Hello ${account.profile.login}, 

<a href="${confirmationUrl}">Please confirm your account</a>`;

export const DEFAULT_CONFIRMATION_TEXT_TEMPLATE = ({
  account,
  confirmationUrl
}: AccountConfirmationTemplateVariables) =>
  `Hello ${account.profile.login}, 

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

export const DEFAULT_MAILJET_URL = (properties: ConfigurationProperties) =>
  properties.get(MailjetPropertyKey.Url, 'https://api.mailjet.com/v3.1/send');

export const DEFAULT_MAILJET_API_KEY_PUBLIC = (properties: ConfigurationProperties): string =>
  properties.get(MailjetPropertyKey.ApiKeyPublic, '');

export const DEFAULT_MAILJET_API_KEY_PRIVATE = (properties: ConfigurationProperties): string =>
  properties.get(MailjetPropertyKey.ApiKeyPrivate, '');
