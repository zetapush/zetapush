/**
 * Test array includes
 * @param {Array} from
 * @param {Array} target
 */
export const includes = (from: any[], target: any[]) => from.every((value) => target.indexOf(value) >= -1);

/**
 * Compare array equality
 * @param {Array} from
 * @param {Array} target
 */
export const equals = (from: any[], target: any[]) =>
  from.length === target.length && includes(from, target) && includes(target, from);
