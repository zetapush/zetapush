import os from 'os';

export const isLinux = () => os.platform() == 'linux';

export const isWindows = () => os.platform().startsWith('win');
