export default class Api {
  async oneStringParam(param1: string) {
    return { param1 };
  }
  async oneNumberParam(param1: number) {
    return { param1 };
  }
  async oneObjectParam(param1: Object) {
    return { param1 };
  }
  async oneArrayParam(param1: any[]) {
    return { param1 };
  }

  async twoStringParams(param1: string, param2: string) {
    return { param1, param2 };
  }
  async twoNumberParams(param1: number, param2: number) {
    return { param1, param2 };
  }
  async twoObjectParams(param1: Object, param2: Object) {
    return { param1, param2 };
  }
  async twoArrayParams(param1: any[], param2: any[]) {
    return { param1, param2 };
  }

  async mixedParams(param1: string, param2: number, param3: Object, param4: any[]) {
    return { param1, param2, param3, param4 };
  }

  async restParamAlone(...rest: any[]) {
    return { rest };
  }
  async restParam(param1: string, ...rest: any[]) {
    return { param1, rest };
  }
}
