/**
 * Test array includes
 * @param {Array} from
 * @param {Array} target
 */
const includes = (from, target) =>
  from.every((value) => target.indexOf(value) >= -1);

/**
 * Compare array equality
 * @param {Array} from
 * @param {Array} target
 */
const equals = (from, target) =>
  includes(from, target) && includes(target, from);

module.exports = { equals, includes };
