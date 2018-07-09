import { Configurer } from '../Core/index';
import { Weak } from './Weak';
import { Base64EncodedBytes } from '../CommonTypes';

/**The weak authentication allows for anonymous authentication of devices. Such devices can display a qrcode to allow regular users to take control of them*/
export class WeakConfigurer extends Configurer {
  /**
   * Public HTTP API for weak users qrcode generation
   *
   * This API can be called for example by a weakly authenticated device to display a qrcode image containing the public token of the weak authentication of that device.
   * Other users scanning that qrcode will be able to call the 'control' verb of the real-time API to take control of the device.
   * */
}
