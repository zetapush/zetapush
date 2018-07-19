import { ScanAnnotations } from './common/core/ScanAnnotations';
import { IsEmail, validate, IsBoolean, IsAlpha, MinLength, Length } from 'class-validator';
import { ValidationAccountCreationManager } from './common/api/Validator';

class Man {
  @Length(5)
  name!: string;
}

class Hello {
  @IsAlpha() name!: string;
}

const toto = new Man();
toto.name = 'damienledantec';

const annot = new ScanAnnotations();
const schema = annot.scan(Man);
console.log('toto');
const schema2 = annot.scan(Hello);

console.log('schema =>', JSON.stringify(schema.properties, null, 4));
console.log('schema2 =>', JSON.stringify(schema2.properties, null, 4));

const validManager = new ValidationAccountCreationManager();

validManager.validate(toto, schema);
