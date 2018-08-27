/**
 * Standard account workflow has 3 statuses.
 *
 * When creating an account, 2 statuses are used:
 * 1. Account is created and flagged with `WaitingConfirmation` status
 * 2. Account is confirmed by the user and flagged with `Active` status
 *
 * When a user is using your service, it is possible to deactivate its account using
 * `Disabled` status
 */
export enum StandardAccountStatus {
  Active = 'ACTIVE',
  WaitingConfirmation = 'WAITING_FOR_CONFIRMATION',
  Disabled = 'DISABLED'
}
