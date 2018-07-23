import { Configurer } from '../Core';
import { Cron } from './Cron';

/**Scheduler service. End-users can schedule one-time or repetitive tasks using a classical cron syntax (with the year field) or a timestamp (milliseconds from the epoch)*/
export class CronConfigurer extends Configurer {}
