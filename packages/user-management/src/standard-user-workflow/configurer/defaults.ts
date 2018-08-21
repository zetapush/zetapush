import { ConfigurationProperties, ZetaPushContext } from '../../common/configurer';
import {
  RegistrationConfirmationPropertyKeys,
  EmailPropertyKeys,
  ProductPropertyKeys,
  MailjetPropertyKey
} from './properties';
import { Token } from '../../common/api';
import { Account } from '../api';

interface DefautAccountConfirmationVariables {
  account: Account;
  token: Token;
  properties: ConfigurationProperties;
  zetapushContext: ZetaPushContext;
}

export const DEFAULT_CONFIRMATION_URL = ({
  properties,
  zetapushContext,
  account,
  token
}: DefautAccountConfirmationVariables) =>
  `${properties.get(RegistrationConfirmationPropertyKeys.BaseUrl, zetapushContext.getFrontUrl())}/${
    account.accountId
  }/${token.value}`;

export const DEFAULT_CONFIRMATION_HTML_TEMPLATE = ({
  properties,
  zetapushContext,
  account,
  token
}: DefautAccountConfirmationVariables) =>
  `Hello ${account.profile.login}, 

<a href="${DEFAULT_CONFIRMATION_URL({ account, token, properties, zetapushContext })}">Please confirm your account</a>`;

export const DEFAULT_CONFIRMATION_TEXT_TEMPLATE = ({
  properties,
  zetapushContext,
  account,
  token
}: DefautAccountConfirmationVariables) =>
  `Hello ${account.profile.login}, 

Please confirm your account: ${DEFAULT_CONFIRMATION_URL({ account, token, properties, zetapushContext })}`;

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
