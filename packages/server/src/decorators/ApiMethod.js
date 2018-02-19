import 'reflect-metadata';
import { API_METHOD_METADATA } from '../metadata/index.js';

export function ApiMethod() {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(API_METHOD_METADATA, true, target, propertyKey);
  };
}
