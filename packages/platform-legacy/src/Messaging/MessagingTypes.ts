import { ListOrSingle, StringAnyMap } from '../CommonTypes';

export interface Message {
  /**Target user or group. Can be either a string, an array of string or an object that contains an array of string. The 'target' property of the output message will have exactly the same form.*/
  target: ListOrSingle;
  /**Optional (alphanumeric) channel name*/
  channel?: string;
  /**User key of the message sender*/
  source?: string;
  /**Data to be sent*/
  data: StringAnyMap;
}
