import { Provider } from '../Provider';
import { Macro } from '../Macro';
import * as zp from '../all_types';

/**Macro-command service. An admin defines macro-commands that can sequentially call any number of other api verbs, loop on collections of data, make decisions, etc... End-users play them, with contextual parameters*/
export class MacroProvider extends Provider {
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
  async create(body: zp.MacroInfo): Promise<void> {
    return await this.provide(
      null,
      Macro.DEFAULT_DEPLOYMENT_ID,
      '/macro/create',
    );
  }
  /**
   * Runs a macro
   *
   * Runs the configured macro for the given route /macro/exec/{route}.
   * The HTTP POST body is expected to be a JSON object
   * The route (after '/exec/') may contain slashes
   * A route is configured along with a macro when it is created
   * The macro is run with the parameters you annotate with @RequestBody, @QueryParam, @RequestParam, @PathParam, @PathVariable, @HeaderParam, @RequestHeader, @Path.
   * */
  async exec(body: zp.StringAnyMap): Promise<zp.ConfigurableHttpOutput> {
    return await this.provide(
      null,
      Macro.DEFAULT_DEPLOYMENT_ID,
      '/macro/exec/**',
    );
  }
  /**
   * Lists the macros
   *
   * Returns the whole list of defined macros.
   * */
  async list(): Promise<zp.MacroInfo[]> {
    return await this.provide(null, Macro.DEFAULT_DEPLOYMENT_ID, '/macro/list');
  }
  /**
   * Creates macros
   *
   * Creates or updates several macro definitions.
   * */
  async mcreate(body: zp.MacroInfos): Promise<zp.MacroUploadReport> {
    return await this.provide(
      null,
      Macro.DEFAULT_DEPLOYMENT_ID,
      '/macro/mcreate',
    );
  }
  /**
   * Runs an arbitrary macro
   *
   * Runs a macro.
   * Any given macro of the service can be called with any given user key.
   * */
  async run(body: zp.SuMacroPlay): Promise<zp.MacroCompletion> {
    return await this.provide(null, Macro.DEFAULT_DEPLOYMENT_ID, '/macro/run');
  }
  /**
   * Validates a macro
   *
   * Validates the macro syntax
   * Only validates the given AST, not the (unavailable) source code.
   * */
  async validate(body: zp.MacroInfo): Promise<string> {
    return await this.provide(
      null,
      Macro.DEFAULT_DEPLOYMENT_ID,
      '/macro/validate',
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
  async configure(body: zp.MacroServiceDebugConfig): Promise<void> {
    return await this.provide(
      null,
      Macro.DEFAULT_DEPLOYMENT_ID,
      '/debug/configure',
    );
  }
  /**
   * Disables debug mode
   *
   * Disables debug mode on this STR node : macro calls will no longer honor their 'debug' field.
   * */
  async disable(): Promise<void> {
    return await this.provide(
      null,
      Macro.DEFAULT_DEPLOYMENT_ID,
      '/debug/disable',
    );
  }
  /**
   * Enables debug mode
   *
   * Enables debug mode on this STR node : macro calls will now honor their 'debug' field.
   * Affects only new macro calls : macros already running continue unaffected.
   * Also enables live debug mode.
   * */
  async enable(): Promise<void> {
    return await this.provide(
      null,
      Macro.DEFAULT_DEPLOYMENT_ID,
      '/debug/enable',
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
  async livedebugToken(): Promise<zp.MacroDebugToken> {
    return await this.provide(
      null,
      Macro.DEFAULT_DEPLOYMENT_ID,
      '/debug/livedebugToken',
    );
  }
  /**
   * Returns the service status
   *
   * Reports the status of this macro service on this STR node.
   * */
  async status(): Promise<zp.MacroServiceStatus> {
    return await this.provide(
      null,
      Macro.DEFAULT_DEPLOYMENT_ID,
      '/debug/status',
    );
  }
}
