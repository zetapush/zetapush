import { Variables, FuncCallTemplateParser } from '../../../../../src';
import 'jasmine';

describe(`FuncCallTemplateParser`, () => {
  it(`should
      - evaluate template string`, async () => {
    const parser = new FuncCallTemplateParser(
      (variables: Variables) => `Hello ${variables.firstname} ${variables.lastname}, how are you ?`
    );
    const result = await parser.parse(null, { firstname: 'Simon', lastname: 'Jérémi' });
    expect(result.toString()).toBe('Hello Simon Jérémi, how are you ?');
  });

  it(`
    using functions
    should
    - evaluate template string
    - be able to call closure functions`, async () => {
    const formatDate = (date: number) => new Date(date).toISOString();
    const parser = new FuncCallTemplateParser((variables: Variables) => `Date: ${formatDate(variables.date)}`);
    const result = await parser.parse(null, { date: 1533129072233 });
    expect(result.toString()).toBe('Date: 2018-08-01T13:11:12.233Z');
  });
});
