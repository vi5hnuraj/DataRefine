import { ExtractedData, ValidationError, ValidationResult } from './types';

import { formatColumnLabel } from '../utils/format';

export class Validator {
  /**
   * Validates extracted data, annotating errors without dropping rows
   */
  static validate(data: ExtractedData, expectedSchema?: Record<string, string>): ValidationResult {
    const errors: ValidationError[] = [];

    data.rows.forEach((row, index) => {
      // 1. Check for empty row
      const isFullyEmpty = Object.values(row).every(v => v === null || v === undefined || String(v).trim() === '');
      
      Object.entries(row).forEach(([col, val]) => {
        const strVal = String(val).trim();
        const displayCol = formatColumnLabel(col);
        
        // 2. Missing values
        if (val === null || val === undefined || strVal === '') {
          if (!isFullyEmpty) {
            errors.push({ row: index, column: col, errorType: 'MISSING_VALUE', message: `Row ${index + 1}, Column '${displayCol}' is missing a value.` });
          }
          return;
        }

        // Schema validation if expected
        if (expectedSchema && expectedSchema[col]) {
          const expectedType = expectedSchema[col];
          
          if (expectedType === 'number') {
            if (isNaN(Number(strVal))) {
              errors.push({ row: index, column: col, errorType: 'INVALID_NUMERIC', message: `Row ${index + 1}, Column '${displayCol}' expects a number but received '${strVal}'.` });
            }
          } else if (expectedType === 'date') {
            if (isNaN(Date.parse(strVal))) {
              errors.push({ row: index, column: col, errorType: 'INVALID_DATE', message: `Row ${index + 1}, Column '${displayCol}' expects a date but received '${strVal}'.` });
            }
          }
        } else {
          // If no strict schema, infer basic invalid scenarios (e.g. looks like numeric column but has 'abc')
          // Optional strict inference logic here if needed.
        }
      });
    });

    return {
      rows: data.rows,
      errors,
      isValid: errors.length === 0
    };
  }
}
