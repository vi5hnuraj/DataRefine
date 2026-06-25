import * as fs from 'fs';
import * as path from 'path';
import { Extractor } from '../extractor';
import { Validator } from '../validator';
import { Cleaner } from '../cleaner';
import { Transformer } from '../transformer';
import { Statistics } from '../statistics';

const run = () => {
  const schema = { id: 'number', name: 'string', age: 'number', join_date: 'date' };
  const csvStr = fs.readFileSync(path.join(__dirname, 'datasets', 'missing-values.csv'), 'utf-8');
  
  const startTime = Date.now();
  
  const extracted = Extractor.extractCsv(csvStr);
  const validated = Validator.validate(extracted, schema);
  const cleaned = Cleaner.clean(validated);
  const transformed = Transformer.transform(cleaned);
  const finalOutput = Statistics.generate(transformed, startTime);
  
  console.log(JSON.stringify(finalOutput, null, 2));
};

run();
