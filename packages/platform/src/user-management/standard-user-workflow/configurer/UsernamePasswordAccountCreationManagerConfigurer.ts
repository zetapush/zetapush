import { UsernamePasswordAccountCreationManager } from '../core';
import { resolve } from 'path';

export class UsernamePasswordAccountCreationManagerConfigurer {
  build(): Promise<UsernamePasswordAccountCreationManager> {
    return new Promise<UsernamePasswordAccountCreationManager>((resolve, reject) => {});
  }
}
