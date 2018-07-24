import { StringAnyMap } from '../CommonTypes';

export interface AggregationItemCategory {
  /**Item type (aggregation behavior).*/
  type: AggregationItemType;
  /**Item periods, in minutes. Automatic aggregation by this service ensures that these will be the minimum visible granularities. Although you can specify arbitrary values, it is recommended, for easier auto-alignment of period boundaries, to use divisors of well known values : for example 30 (half an hour) is a lot better than 29.*/
  periods: number[];
  /**Parameter that will be passed to the target verb when called. The format is the format accepted by the target.*/
  parameter?: StringAnyMap;
  /**Item category. Arbitrary developer-defined name.*/
  category: string;
  /**DeploymentId of the target service.*/
  deploymentId: string;
  /**Verb to be called within the target service.*/
  verb: string;
  /**Specifies whether this call should generate all expected direct user notifications (primary outputs). Does not affect side-effects (other outputs). Defaults to false*/
  loud?: boolean;
}
export enum AggregationItemType {
  /**Averages the item over the period (floating point values).*/
  MEAN = 'MEAN',
  /**Sums the item over the period (integral values only).*/
  TOTAL = 'TOTAL'
}
export interface AggregationPush {
  /**Numerical value : long for totals, floating point (double precision IEEE 754) for means*/
  value: number;
  /**Item name. Any item name, unique for the user. An item more or less matches an actual device or sensor, but it can also be for example a virtual sensor name if you are averaging temperatures from several physical sensors.*/
  name: string;
  /**Item category. Must match a defined category.*/
  category: string;
}
export interface AggregationPushes {
  /**List of items*/
  items: AggregationPush[];
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
