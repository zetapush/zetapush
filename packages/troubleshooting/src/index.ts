import { ErrorHelper } from './helper/error-helper';
import { CacheErrorHelper } from './helper/cache-error-helper';
import { HttpDownloadErrorHelper } from './helper/http-download-error-helper';

export { ErrorAnalyzer } from './analyzer/error-analyzer';
export { displayError, writeLogs } from './analyzer/errors-handler';
export { displayHelp, displayHelpMessage } from './helper/display';

export { ConfigLoadIssueAnalyzer } from './analyzer/config-load-issue';
export { MissingNpmDependencyErrorAnalyzer } from './analyzer/npm-dependency-issue';
export { NetworkIssueAnalyzer } from './analyzer/network-issue';
export { AccessDeniedIssueAnalyzer } from './analyzer/access-denied-issue';
export { InjectionIssueAnalyzer } from './analyzer/injection-issue';
export { CustomCloudServiceStartErrorAnalyzer } from './analyzer/custom-cloud-service-start-issue';
export { OnApplicationBoostrapErrorAnalyser } from './analyzer/bootstrap-issue';
export { WorkerRegisterErrorAnalyser } from './analyzer/worker-register-issue';
export { PackageSyncErrorAnalyser } from './analyzer/package-sync';

export const errorHelper = ErrorHelper.getInstance(() => new CacheErrorHelper(new HttpDownloadErrorHelper(), false));
