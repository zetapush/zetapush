import 'jasmine';
import { VariableEvaluator, EvaluatorMissingKeyHandlerBuilder } from '../../../../src/common/utils/evaluate';

describe(`VariableEvaluator.evaluate()`, () => {
  describe(`on existing property`, () => {
    beforeEach(() => {
      this.evaluator = new VariableEvaluator();
    });

    describe(`and object context`, () => {
      it(`evaluates the property value`, async () => {
        const evaluated = this.evaluator.evaluate('/users/${accountId}', { accountId: 1234 });
        expect(evaluated).toBe('/users/1234');
      });
    });

    describe(`and nested object context`, () => {
      it(`evaluates the nested property value`, async () => {
        const evaluated = this.evaluator.evaluate('/users/${account.accountId}', { account: { accountId: 1234 } });
        expect(evaluated).toBe('/users/1234');
      });
    });

    describe(`and nested array context`, () => {
      it(`evaluates the value at the index`, async () => {
        const evaluated = this.evaluator.evaluate('/users/${0}', [1234]);
        expect(evaluated).toBe('/users/1234');
      });
    });
  });

  describe(`on several existing properties`, () => {
    beforeEach(() => {
      this.evaluator = new VariableEvaluator();
    });

    describe(`and object context`, () => {
      it(`evaluates the property value`, async () => {
        const evaluated = this.evaluator.evaluate('/users/${accountId}/token/${token}', {
          accountId: 1234,
          token: 'abc'
        });
        expect(evaluated).toBe('/users/1234/token/abc');
      });
    });

    describe(`and nested object context`, () => {
      it(`evaluates the nested property value`, async () => {
        const evaluated = this.evaluator.evaluate('/users/${account.accountId}/token/${token.value}', {
          account: { accountId: 1234 },
          token: { value: 'abc' }
        });
        expect(evaluated).toBe('/users/1234/token/abc');
      });
    });

    describe(`and nested array context`, () => {
      it(`evaluates the value at the index`, async () => {
        const evaluated = this.evaluator.evaluate('/users/${0}/token/${1}', [1234, 'abc']);
        expect(evaluated).toBe('/users/1234/token/abc');
      });
    });
  });
});
