/**
 * Default error channel
 * @type {string}
 */
export const DEFAULT_ERROR_CHANNEL = 'error';

/**
 * Provide utilities and abstraction to handle errors
 * @access private
 */
export class ErrorHelper extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
  toString() {
    return `Message: ${this.message}, Code: ${this.code}`;
  }
}
