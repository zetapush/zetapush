import { Service } from '../Core';
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
  breakpoint(body: MacroDebugBreakpointSet) {
    return this.$publish('breakpoint', body);
  }
  info(body: MacroDebugInfoRequest) {
    return this.$publish('info', body);
  }
  livedebug(body: MacroDebugSession) {
    return this.$publish('livedebug', body);
  }
  resume(body: MacroDebugStep) {
    return this.$publish('resume', body);
  }
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
  call(body: MacroPlay) {
    return this.$publish('call', body);
  }
  evaluate(body: MacroFunctionRequest): Promise<MacroFunctionResult> {
    return this.$publish('evaluate', body);
  }
  func(body: MacroPlay): Promise<MacroCompletion> {
    return this.$publish('func', body);
  }
  getPublicHttpUrl(): Promise<MacroExecBaseUrl> {
    return this.$publish('getPublicHttpUrl');
  }
  sudo(body: SuMacroPlay): Promise<MacroCompletion> {
    return this.$publish('sudo', body);
  }
}
