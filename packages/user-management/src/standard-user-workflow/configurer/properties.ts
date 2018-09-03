export enum ProductPropertyKeys {
  OrganizationName = 'organization.name'
}

export enum EmailPropertyKeys {
  From = 'email.from'
}

export enum RegistrationConfirmationPropertyKeys {
  BaseUrl = 'registration.confirmation.base-url',
  EmailFrom = 'registration.confirmation.email.from',
  EmailSubject = 'registration.confirmation.email.subject',
  AccountConfirmedRedirectionUrl = 'registration.confirmation.success-url',
  AccountConfirmationFailedRedirectionUrl = 'registration.confirmation.failure-url'
}

export enum MailjetPropertyKey {
  Url = 'mailjet.url',
  ApiKeyPublic = 'mailjet.apikey-public',
  ApiKeyPrivate = 'mailjet.apikey-private'
}

export enum SmtpPropertyKey {
  Host = 'smtp.host',
  Port = 'smtp.port',
  Username = 'smtp.username',
  Password = 'smtp.password',
  UseSsl = 'smtp.ssl',
  StartTls = 'smtp.starttls'
}
