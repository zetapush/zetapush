import {} from 'jasmine';
import { IsAlpha, Length, IsEmail } from 'class-validator';
import { ScanAnnotations } from '../../../../src/common/core/ScanAnnotations';

describe('ScanAnnotationValidation', function() {
  /**
   * ScanAnnotation instance
   */
  const annotationScanner = new ScanAnnotations();

  /**
   * Basic case
   */
  class BasicClass {
    @IsAlpha() name!: string;
  }
  const basicInstance = new BasicClass();
  basicInstance.name = 'test';
  const basicWanted = { name: [{ type: 'isAlpha', each: false, groups: [], always: false }] };

  it('Scan a basic class with annotation without constraints', function() {
    const resultScan = annotationScanner.scan(BasicClass);
    expect(resultScan.name).toContain(BasicClass.name);
    expect(JSON.stringify(resultScan.properties)).toEqual(JSON.stringify(basicWanted));
  });

  /**
   * Case with constraints
   */
  class ConstraintsClass {
    @Length(5)
    name!: string;
  }
  const constraintsInstance = new ConstraintsClass();
  constraintsInstance.name = 'test';
  const constraintWanted = {
    name: [{ type: 'length', constraints: [5, null], each: false, groups: [], always: false }]
  };

  it('Scan a class with annotation with constraints', function() {
    const resultScan = annotationScanner.scan(ConstraintsClass);
    expect(resultScan.name).toContain(ConstraintsClass.name);
    expect(JSON.stringify(resultScan.properties)).toEqual(JSON.stringify(constraintWanted));
  });

  /**
   * Case with many constraints on same property
   */
  class ManyConstraintsClass {
    @Length(5)
    @IsAlpha()
    name!: string;
  }
  const manyConstraintsInstance = new ManyConstraintsClass();
  manyConstraintsInstance.name = 'test';
  const manyConstraintsWanted = {
    name: [
      { type: 'isAlpha', each: false, groups: [], always: false },
      { type: 'length', constraints: [5, null], each: false, groups: [], always: false }
    ]
  };

  it('Scan a class with annotation with constraints', function() {
    const resultScan = annotationScanner.scan(ManyConstraintsClass);
    expect(resultScan.name).toContain(ManyConstraintsClass.name);
    expect(JSON.stringify(resultScan.properties)).toEqual(JSON.stringify(manyConstraintsWanted));
  });

  /**
   * Complex case with many constraints and many properties
   */
  class ComplexClass {
    @Length(5)
    @IsAlpha()
    name!: string;

    @IsEmail()
    @Length(5, 40)
    email!: string;
  }
  const complexInstance = new ComplexClass();
  complexInstance.name = 'test';
  complexInstance.email = 'test@gmail.com';
  const complexConstraintsWanted = {
    name: [
      { type: 'isAlpha', each: false, groups: [], always: false },
      { type: 'length', constraints: [5, null], each: false, groups: [], always: false }
    ],
    email: [
      { type: 'length', constraints: [5, 40], each: false, groups: [], always: false },
      { type: 'isEmail', constraints: [null], each: false, groups: [], always: false }
    ]
  };

  it('Scan a class with many properties, many annotation with constraints', function() {
    const resultScan = annotationScanner.scan(ComplexClass);
    expect(resultScan.name).toContain(ComplexClass.name);
    expect(JSON.stringify(resultScan.properties)).toEqual(JSON.stringify(complexConstraintsWanted));
  });
});
