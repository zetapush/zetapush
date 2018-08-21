export interface ValidationManager {
  validate(object: Object): void;
}
export abstract class ValidationManagerInjectable implements ValidationManager {
  abstract validate(object: Object): void;
}

export interface ValidationMetadata {
  groups: Array<any>;
  always: boolean;
  each: boolean;
  type: string;
  target: string | Function;
  propertyName: string;
  constraints: Array<any>;
  constraintCls: any;
  validationTypeOptions: any;
}
