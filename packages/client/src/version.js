/**
 * SDK Version
 * @type {string}
 */
export const VERSION = preval`
  const { version } = require('../package.json');
  module.exports = version;
`;
