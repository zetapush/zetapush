import { Service } from '../Core/index';
import {
  MacroCompletion,
  MacroDebugBreakpointSet,
  MacroDebugInfoRequest,
  MacroDebugSession,
  MacroDebugStep,
  MacroDebugVariableChange,
  MacroExecBaseUrl,
  MacroFunctionRequest,
  MacroFunctionResult,
  MacroPlay,
  SuMacroPlay
} from './MacroTypes';

/**
 * Macros
 *
 * Macro-command service
 *  An admin defines macro-commands that can sequentially call any number of other api verbs, loop on collections of data, make decisions, etc
 *
 *
 *  End-users play them, with contextual parameters
 * */
export class Macro extends Service {
  /**
   * Get deployment type associated to Macro service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'macro';
  }
  /**
   * Get default deployment id associated to Macro service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'macro_0';
  }
  /**
   * User API for macro debugging
   *
   * Debugger API for macro.
   * These API verbs are not intended for use by most developers.
   * @access public
   * */
  /**
   * Enables or disables a breakpoint
   *
   * @access public
   * */
  breakpoint(body: MacroDebugBreakpointSet) {
    return this.$publish('breakpoint', body);
  }
  /**
   * Requests some information
   *
   * @access public
   * */
  info(body: MacroDebugInfoRequest) {
    return this.$publish('info', body);
  }
  /**
   * Debugs a previously recorded macro
   *
   * The given breakpoints will be honored, causing a suspension of the execution, resumable via 'resume'.
   * Only one debug session can be active at any given time.
   * @access public
   * */
  livedebug(body: MacroDebugSession) {
    return this.$publish('livedebug', body);
  }
  /**
   * Resumes a paused macro
   *
   * @access public
   * */
  resume(body: MacroDebugStep) {
    return this.$publish('resume', body);
  }
  /**
   * Sets a variable value
   *
   * @access public
   * */
  variable(body: MacroDebugVariableChange) {
    return this.$publish('variable', body);
  }
  /**
   * User API for macro execution
   *
   * Simple errors are reported as usual.
   * However, the macro execution verbs treat most errors in a particular way : instead of reporting errors on the usual 'error' channel, errors are put in the returned 'MacroCompletion' result.
   * This behavior can be tuned on a per-call basis with the hardFail parameter.
   * Note that some particular errors will always behave as if hardFail were true, because they are related to programming errors, or prevent processing from ending gracefully : STACK_OVERFLOW, NO_SUCH_FUNCTION, RAM_EXCEEDED, CYCLES_EXCEEDED, TIME_EXCEEDED, QUOTA_EXCEEDED, RATE_EXCEEDED, BAD_COMPARATOR_VALUE
   * @access public
   * */
  /**
   * Plays a previously recorded macro
   *
   * DO NOT use this verb from inside an enclosing macro when you need the result in order to proceed with the enclosing macro.
   * You can override the default notification channel when defining the macro.
   * @access public
   * */
  call(body: MacroPlay) {
    return this.$publish('call', body);
  }
  /**
   * Evaluates a function result.
   *
   * @access public
   * */
  evaluate(body: MacroFunctionRequest): Promise<MacroFunctionResult> {
    return this.$publish('evaluate', body);
  }
  /**
   * Plays a previously recorded macro and returns the result.
   *
   * Use this verb when you want to synchronously call a macro from inside another macro.
   * Despite being a server verb, func will honor the 'loud' modifier in ZMS.
   * @access public
   * */
  func(body: MacroPlay): Promise<MacroCompletion> {
    return this.$publish('func', body);
  }
  /**
   * Returns the base HTTP URL for 'macro/exec' in this macro service.
   *
   * @access public
   * */
  getPublicHttpUrl(): Promise<MacroExecBaseUrl> {
    return this.$publish('getPublicHttpUrl');
  }
  /**
   * Similar to func, with the ability to impersonate any user at will.
   *
   * Use this verb when you do not want to use or cannot use the standard rights system and wish to bypass it completely.
   * Use this verb sparingly, as it can give the caller any right on any resource.
   * @access public
   * */
  sudo(body: SuMacroPlay): Promise<MacroCompletion> {
    return this.$publish('sudo', body);
  }
}
