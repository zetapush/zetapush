export enum ProductPropertyKeys {
  OrganizationName = 'organization.name',
  ProductName = 'product.name'
}

export enum EmailPropertyKeys {
  From = 'email.from'
}

export enum RegistrationConfirmationPropertyKeys {
  EmailFrom = 'registration.confirmation.email.from',
  EmailSubject = 'registration.confirmation.email.subject',
  AccountConfirmationUrl = 'registration.confirmation.confirm-url',
  AccountConfirmedRedirectionUrl = 'registration.confirmation.success-url',
  AccountConfirmationFailedRedirectionUrl = 'registration.confirmation.failure-url'
}

export enum ResetPasswordPropertiesKeys {
  AskUrl = 'reset-password.ask.url',
  EmailFrom = 'reset-password.ask.email.from',
  EmailSubject = 'reset-password.ask.email.subject'
}

export enum MailjetPropertyKey {
  Enable = 'mailjet.enable',
  Url = 'mailjet.url',
  ApiKeyPublic = 'mailjet.apikey-public',
  ApiKeyPrivate = 'mailjet.apikey-private'
}

export enum SmtpPropertyKey {
  Enable = 'smtp.enable',
  Host = 'smtp.host',
  Port = 'smtp.port',
  Username = 'smtp.username',
  Password = 'smtp.password',
  UseSsl = 'smtp.ssl',
  StartTls = 'smtp.starttls'
}
