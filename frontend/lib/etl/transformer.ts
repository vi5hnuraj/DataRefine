import { CleanedResult, TransformedResult } from './types';

export class Transformer {
  /**
   * Transforms clean string data into proper JavaScript primitives
   */
  static transform(cleanedResult: CleanedResult): TransformedResult {
    const rows = cleanedResult.rows;
    if (rows.length === 0) {
      return {
        rows: [],
        columns: {},
        validationErrors: cleanedResult.validationErrors,
        cleanedMeta: {
          droppedDuplicateRowsCount: cleanedResult.droppedDuplicateRowsCount,
          droppedEmptyRowsCount: cleanedResult.droppedEmptyRowsCount,
          nullValuesStandardizedCount: cleanedResult.nullValuesStandardizedCount
        }
      };
    }

    const columns: Record<string, 'string' | 'number' | 'date' | 'boolean'> = {};
    const headers = Object.keys(rows[0]);

    // Simple type inference based on first non-null value per column
    headers.forEach(header => {
      let inferredType: 'string' | 'number' | 'date' | 'boolean' = 'string';
      for (const row of rows) {
        const val = row[header];
        if (val !== null) {
          if (!isNaN(Number(val))) {
            inferredType = 'number';
          } else if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') {
            inferredType = 'boolean';
          } else if (!isNaN(Date.parse(val))) {
            inferredType = 'date';
          }
          break; // Stop checking after first valid inference
        }
      }
      columns[header] = inferredType;
    });

    // Apply transformations
    const transformedRows = rows.map(row => {
      const newRow: Record<string, any> = {};
      headers.forEach(header => {
        const val = row[header];
        if (val === null) {
          newRow[header] = null;
          return;
        }

        switch (columns[header]) {
          case 'number':
            newRow[header] = Number(val);
            break;
          case 'boolean':
            newRow[header] = val.toLowerCase() === 'true';
            break;
          case 'date':
            newRow[header] = new Date(val).toISOString();
            break;
          default:
            newRow[header] = String(val);
        }
      });
      return newRow;
    });

    return {
      rows: transformedRows,
      columns,
      validationErrors: cleanedResult.validationErrors,
      cleanedMeta: {
        droppedDuplicateRowsCount: cleanedResult.droppedDuplicateRowsCount,
        droppedEmptyRowsCount: cleanedResult.droppedEmptyRowsCount,
        nullValuesStandardizedCount: cleanedResult.nullValuesStandardizedCount
      }
    };
  }
}
