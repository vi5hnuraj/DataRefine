import { CleanedResult, ValidationResult, ValidationError } from './types';

export class Cleaner {
  /**
   * Cleans data by dropping empty rows, removing duplicates, and standardizing nulls
   */
  static clean(validationResult: ValidationResult): CleanedResult {
    const rawRows = validationResult.rows;
    const finalRows: Record<string, any>[] = [];
    
    let droppedEmptyRowsCount = 0;
    let droppedDuplicateRowsCount = 0;
    let nullValuesStandardizedCount = 0;

    const seenHashes = new Set<string>();

    // We also need to map the validation errors to the new row indices if we wanted to maintain strict reference.
    // For simplicity, we just keep the validation errors as metadata about the original raw dataset.

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      
      // 1. Check for empty row
      const isFullyEmpty = Object.values(row).every(v => v === null || v === undefined || String(v).trim() === '');
      if (isFullyEmpty) {
        droppedEmptyRowsCount++;
        continue;
      }

      // 2. Standardize null values and build a hash string
      const standardizedRow: Record<string, any> = {};
      let hashStr = "";
      
      Object.entries(row).forEach(([col, val]) => {
        const strVal = String(val).trim();
        if (val === null || val === undefined || strVal === '' || strVal.toLowerCase() === 'null' || strVal.toLowerCase() === 'n/a') {
          standardizedRow[col] = null;
          nullValuesStandardizedCount++;
          hashStr += `${col}:null|`;
        } else {
          standardizedRow[col] = strVal;
          hashStr += `${col}:${strVal}|`;
        }
      });

      // 3. Check for duplicates
      if (seenHashes.has(hashStr)) {
        droppedDuplicateRowsCount++;
        continue;
      }
      
      seenHashes.add(hashStr);
      finalRows.push(standardizedRow);
    }

    return {
      rows: finalRows,
      droppedEmptyRowsCount,
      droppedDuplicateRowsCount,
      nullValuesStandardizedCount,
      validationErrors: validationResult.errors
    };
  }
}
