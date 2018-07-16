'use strict';
var __extends =
  (this && this.__extends) ||
  (function() {
    var extendStatics =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function(d, b) {
          d.__proto__ = b;
        }) ||
      function(d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
      };
    return function(d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
exports.__esModule = true;
var ExpirableToken = /** @class */ (function() {
  /**
   * @param original The original token that has been generated
   * @param expires The expiration date as timestamp
   */
  function ExpirableToken(original, expires) {
    this.original = original;
    this.expires = expires;
  }
  Object.defineProperty(ExpirableToken.prototype, 'value', {
    get: function() {
      return this.original.value;
    },
    enumerable: true,
    configurable: true
  });
  return ExpirableToken;
})();
exports.ExpirableToken = ExpirableToken;
var TokenGenerationError = /** @class */ (function(_super) {
  __extends(TokenGenerationError, _super);
  function TokenGenerationError() {
    return (_super !== null && _super.apply(this, arguments)) || this;
  }
  return TokenGenerationError;
})(Error);
exports.TokenGenerationError = TokenGenerationError;
