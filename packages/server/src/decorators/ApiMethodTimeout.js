import 'reflect-metadata';
import { API_METHOD_TIMEOUT_METADATA } from '../metadata/index.js';

export function ApiMethodTimeout() {
  return (target, propertyKey, descriptor) => {
    Reflect.defineMetadata(
      API_METHOD_TIMEOUT_METADATA,
      true,
      target,
      propertyKey,
    );
  };
}
