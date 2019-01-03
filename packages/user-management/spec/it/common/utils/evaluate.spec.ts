import 'jasmine';
import {
  VariableEvaluator,
  EvaluatorMissingKeyHandlerBuilder,
  MissingKeyError
} from '../../../../src/common/utils/evaluate';

describe(`VariableEvaluator.evaluate()`, () => {
  describe(`configured to fail on missing property`, () => {
    beforeEach(() => {
      const missingKeyHandler = new EvaluatorMissingKeyHandlerBuilder()
        /**/ .error((key) => `Missing key ${key}`)
        /**/ .build();
      this.evaluator = new VariableEvaluator(missingKeyHandler);
    });

    describe(`called with missing key`, () => {
      it(`throws an error with the configured message`, async () => {
        expect(() => {
          this.evaluator.evaluate('/users/${accountId}/token/${token}', { foo: 1234, bar: 'abc' });
        }).toThrowError(MissingKeyError, 'Missing key accountId');
      });
    });

    describe(`called on null context`, () => {
      it(`throws an error with the configured message`, async () => {
        expect(() => {
          this.evaluator.evaluate('/users/${accountId}/token/${token}', null);
        }).toThrowError(MissingKeyError, 'Missing key accountId');
      });
    });

    describe(`called on undefined context`, () => {
      it(`throws an error with the configured message`, async () => {
        expect(() => {
          this.evaluator.evaluate('/users/${accountId}/token/${token}', undefined);
        }).toThrowError(MissingKeyError, 'Missing key accountId');
      });
    });

    describe(`called on empy context`, () => {
      it(`throws an error with the configured message`, async () => {
        expect(() => {
          this.evaluator.evaluate('/users/${accountId}/token/${token}', {});
        }).toThrowError(MissingKeyError, 'Missing key accountId');
      });
    });
  });

  describe(`configured to ignore missing property`, () => {
    beforeEach(() => {
      const missingKeyHandler = new EvaluatorMissingKeyHandlerBuilder()
        /**/ .ignore()
        /**/ .build();
      this.evaluator = new VariableEvaluator(missingKeyHandler);
    });

    describe(`called with missing key`, () => {
      it(`evaluates as empty string`, async () => {
        const evaluated = this.evaluator.evaluate('/users/${accountId}/token/${token}', { foo: 1234, bar: 'abc' });
        expect(evaluated).toBe('/users//token/');
      });
    });

    describe(`called on null context`, () => {
      it(`throws an error with the configured message`, async () => {
        const evaluated = this.evaluator.evaluate('/users/${accountId}/token/${token}', null);
        expect(evaluated).toBe('/users//token/');
      });
    });

    describe(`called on undefined context`, () => {
      it(`throws an error with the configured message`, async () => {
        const evaluated = this.evaluator.evaluate('/users/${accountId}/token/${token}', undefined);
        expect(evaluated).toBe('/users//token/');
      });
    });

    describe(`called on empy context`, () => {
      it(`throws an error with the configured message`, async () => {
        const evaluated = this.evaluator.evaluate('/users/${accountId}/token/${token}', {});
        expect(evaluated).toBe('/users//token/');
      });
    });
  });

  describe(`configured to provide default value on missing property`, () => {
    beforeEach(() => {
      const missingKeyHandler = new EvaluatorMissingKeyHandlerBuilder()
        /**/ .defaultValue((key) => (key === 'accountId' ? '1234' : 'abc'))
        /**/ .build();
      this.evaluator = new VariableEvaluator(missingKeyHandler);
    });

    describe(`called with missing key`, () => {
      it(`evaluates as empty string`, async () => {
        const evaluated = this.evaluator.evaluate('/users/${accountId}/token/${token}', { foo: 1234, bar: 'abc' });
        expect(evaluated).toBe('/users/1234/token/abc');
      });
    });

    describe(`called on null context`, () => {
      it(`throws an error with the configured message`, async () => {
        const evaluated = this.evaluator.evaluate('/users/${accountId}/token/${token}', null);
        expect(evaluated).toBe('/users/1234/token/abc');
      });
    });

    describe(`called on undefined context`, () => {
      it(`throws an error with the configured message`, async () => {
        const evaluated = this.evaluator.evaluate('/users/${accountId}/token/${token}', undefined);
        expect(evaluated).toBe('/users/1234/token/abc');
      });
    });

    describe(`called on empy context`, () => {
      it(`throws an error with the configured message`, async () => {
        const evaluated = this.evaluator.evaluate('/users/${accountId}/token/${token}', {});
        expect(evaluated).toBe('/users/1234/token/abc');
      });
    });
  });
});
