import { expect, test, describe } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { Extractor } from '../extractor';
import { Validator } from '../validator';
import { Cleaner } from '../cleaner';
import { Transformer } from '../transformer';
import { Statistics } from '../statistics';

describe('ETL Pipeline', () => {
  const schema = { id: 'number', name: 'string', age: 'number', join_date: 'date' };

  test('Processes valid.csv correctly', () => {
    const csvStr = fs.readFileSync(path.join(__dirname, 'datasets', 'valid.csv'), 'utf-8');
    const startTime = Date.now();
    
    const extracted = Extractor.extractCsv(csvStr);
    expect(extracted.totalRawRows).toBe(3);
    
    const validated = Validator.validate(extracted, schema);
    expect(validated.isValid).toBe(true);
    expect(validated.errors.length).toBe(0);
    
    const cleaned = Cleaner.clean(validated);
    expect(cleaned.rows.length).toBe(3);
    expect(cleaned.droppedEmptyRowsCount).toBe(0);
    expect(cleaned.droppedDuplicateRowsCount).toBe(0);
    
    const transformed = Transformer.transform(cleaned);
    expect(transformed.columns['age']).toBe('number');
    
    const finalOutput = Statistics.generate(transformed, startTime);
    expect(finalOutput.statistics.validRecords).toBe(3);
    expect(finalOutput.statistics.invalidRecords).toBe(0);
  });

  test('Handles duplicate-records.csv', () => {
    const csvStr = fs.readFileSync(path.join(__dirname, 'datasets', 'duplicate-records.csv'), 'utf-8');
    const startTime = Date.now();
    
    const extracted = Extractor.extractCsv(csvStr);
    expect(extracted.totalRawRows).toBe(5);
    
    const validated = Validator.validate(extracted, schema);
    const cleaned = Cleaner.clean(validated);
    expect(cleaned.droppedDuplicateRowsCount).toBe(2);
    expect(cleaned.rows.length).toBe(3);
    
    const transformed = Transformer.transform(cleaned);
    const finalOutput = Statistics.generate(transformed, startTime);
    expect(finalOutput.statistics.duplicateRecords).toBe(2);
  });

  test('Handles missing-values.csv', () => {
    const csvStr = fs.readFileSync(path.join(__dirname, 'datasets', 'missing-values.csv'), 'utf-8');
    const startTime = Date.now();
    
    const extracted = Extractor.extractCsv(csvStr);
    expect(extracted.totalRawRows).toBe(5);
    
    const validated = Validator.validate(extracted, schema);
    expect(validated.errors.length).toBeGreaterThan(0);
    
    const cleaned = Cleaner.clean(validated);
    expect(cleaned.droppedEmptyRowsCount).toBe(1);
    
    const transformed = Transformer.transform(cleaned);
    const finalOutput = Statistics.generate(transformed, startTime);
    expect(finalOutput.qualityReport.emptyRowsRemoved).toBe(1);
    expect(finalOutput.qualityReport.invalidRecords).toBeGreaterThan(0);
  });

  test('Handles invalid-numbers.csv', () => {
    const csvStr = fs.readFileSync(path.join(__dirname, 'datasets', 'invalid-numbers.csv'), 'utf-8');
    const startTime = Date.now();
    
    const extracted = Extractor.extractCsv(csvStr);
    const validated = Validator.validate(extracted, schema);
    
    const numericErrors = validated.errors.filter((e: any) => e.errorType === 'INVALID_NUMERIC');
    expect(numericErrors.length).toBe(2);
  });

  test('Handles invalid-dates.csv', () => {
    const csvStr = fs.readFileSync(path.join(__dirname, 'datasets', 'invalid-dates.csv'), 'utf-8');
    const startTime = Date.now();
    
    const extracted = Extractor.extractCsv(csvStr);
    const validated = Validator.validate(extracted, schema);
    
    const dateErrors = validated.errors.filter((e: any) => e.errorType === 'INVALID_DATE');
    expect(dateErrors.length).toBeGreaterThan(0);
  });
});
