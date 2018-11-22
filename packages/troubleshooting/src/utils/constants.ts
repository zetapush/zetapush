const { ZP_DOC_BASE_URL, ZP_DOC_SOURCE_BASE_URL, ZP_HELP_CACHE_EXPIRATION } = process.env;

export const DOC_BASE_URL: string = ZP_DOC_BASE_URL || 'https://zetapush.github.io/documentation';
export const DOC_SOURCE_BASE_URL: string =
  ZP_DOC_SOURCE_BASE_URL || 'https://raw.githubusercontent.com/zetapush/documentation/master';
export const HELP_CACHE_EXPIRATION: number = ZP_HELP_CACHE_EXPIRATION
  ? parseInt(ZP_HELP_CACHE_EXPIRATION, 10)
  : 7 * 24 * 60 * 60 * 1000;

export enum ExitCode {
  CONFIG_01 = 'CONFIG-01',
  CONFIG_02 = 'CONFIG-02',
  CONFIG_03 = 'CONFIG-03',
  CONFIG_04 = 'CONFIG-04',
  CONFIG_05 = 'CONFIG-05',
  CONFIG_06 = 'CONFIG-06',
  NET_01 = 'NET-01',
  NET_02 = 'NET-02',
  NET_03 = 'NET-03',
  NET_04 = 'NET-04',
  NET_05 = 'NET-05',
  DEPENDENCY_01 = 'DEPENDENCY-01',
  DEPENDENCY_02 = 'DEPENDENCY-02',
  ACCOUNT_01 = 'ACCOUNT-01',
  ACCOUNT_02 = 'ACCOUNT-02',
  ACCOUNT_03 = 'ACCOUNT-03',
  ACCOUNT_04 = 'ACCOUNT-04',
  ACCOUNT_05 = 'ACCOUNT-05',
  ACCOUNT_06 = 'ACCOUNT-06',
  INJECTION_01 = 'INJECTION-01',
  SERVICE_04 = 'SERVICE-04',
  SERVICE_05 = 'SERVICE-05',
  BOOTSTRAP_01 = 'BOOTSTRAP-01',
  WORKER_REGISTER_01 = 'WORKER-REGISTER-01'
}

type ExitCodes = { [code in ExitCode]: number };

export const EXIT_CODES: ExitCodes = {
  'CONFIG-01': 1,
  'CONFIG-02': 2,
  'CONFIG-03': 3,
  'CONFIG-04': 4,
  'CONFIG-05': 5,
  'CONFIG-06': 6,
  'NET-01': 11,
  'NET-02': 12,
  'NET-03': 13,
  'NET-04': 14,
  'NET-05': 15,
  'DEPENDENCY-01': 31,
  'DEPENDENCY-02': 32,
  'ACCOUNT-01': 51,
  'ACCOUNT-02': 52,
  'ACCOUNT-03': 53,
  'ACCOUNT-04': 54,
  'ACCOUNT-05': 55,
  'ACCOUNT-06': 56,
  'INJECTION-01': 71,
  'SERVICE-04': 94,
  'SERVICE-05': 95,
  'BOOTSTRAP-01': 110,
  'WORKER-REGISTER-01': 210
};
