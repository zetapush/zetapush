import 'reflect-metadata';
import { API_NAMESPACE_METADATA } from '../metadata/index.js';

export function Api(namespace = '') {
  return (target) => {
    Reflect.defineMetadata(PATH_METADATA, namespace, target);
  };
}
