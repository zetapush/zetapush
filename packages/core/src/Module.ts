import { Class } from './Types';
import { Provider, TypeDecorator, makeDecorator } from './Injection';

export type Configurer = Class;
export type ModuleToImport = Class;

export type Expose =
  | Class
  | {
      [namespace: string]: Class;
    };

export interface Module {
  expose?: Expose;
  imports?: ModuleToImport[];
  providers?: Provider[];
  configurers?: Configurer[];
}

export interface ModuleDecorator {
  /**
   * Marks a class as an NgModule and supplies configuration metadata.
   */
  (obj?: Module): TypeDecorator;
  new (obj?: Module): Module;
}

class ModuleDecoratorFactory {
  static get type() {
    return 'ModuleDecoratorFactory';
  }
}

export const Module: ModuleDecorator = <ModuleDecorator>makeDecorator(
  'ZetaPush:Module',
  {
    expose: {},
    imports: [],
    providers: [],
    configurers: []
  },
  ModuleDecoratorFactory
);

export const isDecoratedModule = (module: Class): boolean => {
  const annotations: any[] = Reflect.getMetadata('annotations', module) || [];
  return annotations.find((annotation) => annotation.constructor.name === ModuleDecoratorFactory.type);
};

export const getDecoratedModule = (module: Class): Module => {
  const annotations: any[] = Reflect.getMetadata('annotations', module) || [];
  return annotations.reduce(
    (reduced, annotation) => {
      return annotation instanceof ModuleDecoratorFactory ? annotation : reduced;
    },
    {
      expose: {},
      imports: [],
      providers: [],
      configurers: []
    }
  );
};
