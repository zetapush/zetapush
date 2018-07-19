import { ScanAnnotations } from './common/core/ScanAnnotations';
import {
  IsEmail,
  validate,
  IsBoolean,
  IsAlpha,
  MinLength,
} from 'class-validator';
import { ValidationAccountCreationManager } from './common/api/Validator';

class Man {
  @IsEmail() email!: string;

  @IsAlpha()
  @MinLength(10)
  name!: string;
}

class Hello {
  @IsAlpha() name!: string;
}

const toto = new Man();
toto.name = 'damienledantec';
toto.email = 'damien.le-dantec@zetapush.com';
const hello = new Hello();

const annot = new ScanAnnotations();
const schema = annot.scan(Man);

const validManager = new ValidationAccountCreationManager();

validManager.validate(toto, schema);
