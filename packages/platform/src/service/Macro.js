/**
 * User API for macro execution
 *
 * Simple errors are reported as usual.
 * However, the macro execution verbs treat most errors in a particular way : instead of reporting errors on the usual 'error' channel, errors are put in the returned 'MacroCompletion' result.
 * This behavior can be tuned on a per-call basis with the hardFail parameter.
 * Note that some particular errors will always behave as if hardFail were true, because they are related to programming errors, or prevent processing from ending gracefully : STACK_OVERFLOW, NO_SUCH_FUNCTION, RAM_EXCEEDED, CYCLES_EXCEEDED, TIME_EXCEEDED, QUOTA_EXCEEDED, RATE_EXCEEDED, BAD_COMPARATOR_VALUE
 * @access public
 * */
export class Macro extends Service {
  /**
   * Get default deployment id associated to Macro service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'macro_0';
  }
  /**
   * Plays a previously recorded macro
   *
   * DO NOT use this verb from inside an enclosing macro when you need the result in order to proceed with the enclosing macro.
   * You can override the default notification channel when defining the macro.
   * */
  call({ parameters, hardFail, name, requestId, debug }) {
    return this.$publish('call', {
      parameters,
      hardFail,
      name,
      requestId,
      debug,
    });
  }
}
