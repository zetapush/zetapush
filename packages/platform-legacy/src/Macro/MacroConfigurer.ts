import { Configurer } from '../Core/index';
import { Macro } from './Macro';
import { ConfigurableHttpOutput, StringAnyMap } from '../CommonTypes';
import {
  MacroCompletion,
  MacroDebugToken,
  MacroInfo,
  MacroInfos,
  MacroServiceDebugConfig,
  MacroServiceStatus,
  MacroUploadReport,
  SuMacroPlay
} from './MacroTypes';

/**Macro-command service. An admin defines macro-commands that can sequentially call any number of other api verbs, loop on collections of data, make decisions, etc... End-users play them, with contextual parameters*/
export class MacroConfigurer extends Configurer {
  /**
   * Administrative API for macros
   *
   * Manage your macro definitions here.
   * Create, validate, delete and list macros.
   * These APIs are used by the eclipse plugin and the CLI : most users will never use them directly.
   * */
  /**
   * Creates a macro
   *
   * Creates or updates a macro definition.
   * */
  create(body: MacroInfo): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Macro.DEFAULT_DEPLOYMENT_ID,
      'macro/create'
    );
  }
  /**
   * Lists the macros
   *
   * Returns the whole list of defined macros.
   * */
  list(): Promise<MacroInfo[]> {
    return this.$configure(
      null,
      /* TODO value from instance-local variable  */ Macro.DEFAULT_DEPLOYMENT_ID,
      'macro/list'
    );
  }
  /**
   * Creates macros
   *
   * Creates or updates several macro definitions.
   * */
  mcreate(body: MacroInfos): Promise<MacroUploadReport> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Macro.DEFAULT_DEPLOYMENT_ID,
      'macro/mcreate'
    );
  }
  /**
   * Runs an arbitrary macro
   *
   * Runs a macro.
   * Any given macro of the service can be called with any given user key.
   * */
  run(body: SuMacroPlay): Promise<MacroCompletion> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Macro.DEFAULT_DEPLOYMENT_ID,
      'macro/run'
    );
  }
  /**
   * Validates a macro
   *
   * Validates the macro syntax
   * Only validates the given AST, not the (unavailable) source code.
   * */
  validate(body: MacroInfo): Promise<string> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Macro.DEFAULT_DEPLOYMENT_ID,
      'macro/validate'
    );
  }
  /**
   * Administrative debug API for macros
   *
   * Manage debug mode: enable, disable and report.
   * */
  /**
   * Configures debug mode
   *
   * Enables or disables debug mode on this STR node. See 'enable' for details.
   * */
  configure(body: MacroServiceDebugConfig): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Macro.DEFAULT_DEPLOYMENT_ID,
      'debug/configure'
    );
  }
  /**
   * Disables debug mode
   *
   * Disables debug mode on this STR node : macro calls will no longer honor their 'debug' field.
   * */
  disable(): Promise<void> {
    return this.$configure(
      null,
      /* TODO value from instance-local variable  */ Macro.DEFAULT_DEPLOYMENT_ID,
      'debug/disable'
    );
  }
  /**
   * Enables debug mode
   *
   * Enables debug mode on this STR node : macro calls will now honor their 'debug' field.
   * Affects only new macro calls : macros already running continue unaffected.
   * Also enables live debug mode.
   * */
  enable(): Promise<void> {
    return this.$configure(
      null,
      /* TODO value from instance-local variable  */ Macro.DEFAULT_DEPLOYMENT_ID,
      'debug/enable'
    );
  }
  /**
   * Returns a debug token
   *
   * Returns a debug token, which is needed to initiate a debug session.
   * This verb does not enable the debug mode : the token is returned only when the debug mode has been enabled with /enable.
   * Treat the returned token as a secret, as it theoretically allows any end-user to debug any macro.
   * The token validity duration is limited.
   * */
  livedebugToken(): Promise<MacroDebugToken> {
    return this.$configure(
      null,
      /* TODO value from instance-local variable  */ Macro.DEFAULT_DEPLOYMENT_ID,
      'debug/livedebugToken'
    );
  }
  /**
   * Returns the service status
   *
   * Reports the status of this macro service on this STR node.
   * */
  status(): Promise<MacroServiceStatus> {
    return this.$configure(
      null,
      /* TODO value from instance-local variable  */ Macro.DEFAULT_DEPLOYMENT_ID,
      'debug/status'
    );
  }
}
