/**
 * Alpha numeric dictionary
 */
const DICTIONARY = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Get random id
 * @return {string}
 */
export const uuid = (entropy = 7, dictionary = DICTIONARY) =>
  Array.from(Array(entropy)).reduce((previous) => {
    const next = dictionary.charAt(Math.floor(Math.random() * dictionary.length));
    return `${previous}${next}`;
  }, '');

/**
 * @access private
 * @param {Array<Object>} list
 * @return {Object}
 */
export const shuffle = (list) => {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
};
