export interface ConfirmationRedirection {}

export interface FullUrlConfirmationRedirection
  extends ConfirmationRedirection {
  url: string;
}

export interface AnchorConfirmationRedirection extends ConfirmationRedirection {
  anchor: string;
}
