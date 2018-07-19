import {} from 'jasmine';
import { Length, IsAlpha, IsEmail } from 'class-validator';
import { ValidationAccountCreationManager } from '../../../../src/common/api/Validator';
import { AccountCreationValidationError } from '../../../../src/user-management/standard-user-workflow/api/exceptions';

describe('ValidationAccountCreationManager', function() {
  const validator = new ValidationAccountCreationManager();

  const inputCorrectSchema = {
    name: 'ComplexClass_1532012582913',
    properties: {
      name: [
        { type: 'isAlpha', each: false, groups: [], always: false },
        { type: 'length', constraints: [5, null], each: false, groups: [], always: false }
      ],
      email: [
        { type: 'length', constraints: [5, 40], each: false, groups: [], always: false },
        { type: 'isEmail', constraints: [null], each: false, groups: [], always: false }
      ]
    }
  };

  class ComplexClass {
    @Length(5)
    @IsAlpha()
    name!: string;

    @IsEmail()
    @Length(5, 40)
    email!: string;
  }

  const instanceTestSuccess = new ComplexClass();
  instanceTestSuccess.name = 'thisisatest';
  instanceTestSuccess.email = 'test@gmail.com';

  const instanceTestFailed = new ComplexClass();
  instanceTestFailed.name = 'thisisatest';
  instanceTestFailed.email = 'test';
  const contextForFailedTest = [
    {
      watchedObject: { name: 'thisisatest', email: 'test' },
      targetProperty: 'email',
      constraints: [
        { constraintName: 'length', errorMessage: 'email must be longer than or equal to 5 characters' },
        { constraintName: 'isEmail', errorMessage: 'email must be an email' }
      ]
    }
  ];

  it('The test should works', function() {
    validator.validate(instanceTestSuccess, inputCorrectSchema);
  });

  it('The test should failed if the instance is not valid', async function(done) {
    try {
      await validator.validate(instanceTestFailed, inputCorrectSchema);
    } catch (e) {
      if (e instanceof AccountCreationValidationError) {
        expect(JSON.stringify(e.context)).toContain(JSON.stringify(contextForFailedTest));
        done();
      }
    }
  });
});
