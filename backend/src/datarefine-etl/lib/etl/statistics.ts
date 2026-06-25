import { TransformedResult, DatasetStatistics, DataQualityReport, FinalETLOutput, ColumnStats } from './types';

export class Statistics {
  /**
   * Analyzes transformed data to generate Statistics and DataQualityReport
   */
  static generate(transformed: TransformedResult, startTime: number): FinalETLOutput {
    const processingTimeMs = Date.now() - startTime;
    const rows = transformed.rows;
    
    // Determine Numeric columns
    const numericCols: string[] = Object.entries(transformed.columns)
      .filter(([_, type]) => type === 'number')
      .map(([col, _]) => col);

    const numericStats: Record<string, { sum: number; count: number; min: number; max: number }> = {};
    numericCols.forEach(c => {
      numericStats[c] = { sum: 0, count: 0, min: Infinity, max: -Infinity };
    });

    rows.forEach(row => {
      numericCols.forEach(col => {
        const val = row[col];
        if (val !== null && typeof val === 'number') {
          numericStats[col].sum += val;
          numericStats[col].count++;
          if (val < numericStats[col].min) numericStats[col].min = val;
          if (val > numericStats[col].max) numericStats[col].max = val;
        }
      });
    });

    const finalNumericColumns: Record<string, ColumnStats> = {};
    numericCols.forEach(col => {
      const st = numericStats[col];
      if (st.count > 0) {
        finalNumericColumns[col] = {
          min: st.min,
          max: st.max,
          avg: Number((st.sum / st.count).toFixed(4))
        };
      } else {
        finalNumericColumns[col] = { min: null, max: null, avg: null };
      }
    });

    const totalRawRecords = rows.length + transformed.cleanedMeta.droppedEmptyRowsCount + transformed.cleanedMeta.droppedDuplicateRowsCount;
    // Calculate invalid rows based on validation errors (unique row indexes with errors)
    const invalidRowIndexes = new Set(transformed.validationErrors.map(e => e.row));
    
    // User requested: "Valid Records count must match processed dataset"
    const validRecordsCount = rows.length;
    const invalidRecordsCount = invalidRowIndexes.size;
    
    const stats: DatasetStatistics = {
      totalRecords: totalRawRecords,
      validRecords: validRecordsCount,
      invalidRecords: invalidRecordsCount,
      duplicateRecords: transformed.cleanedMeta.droppedDuplicateRowsCount,
      nullValues: transformed.cleanedMeta.nullValuesStandardizedCount,
      numericColumns: finalNumericColumns,
      processingTimeMs,
      processingStatus: "SUCCESS",
      validationErrorCount: transformed.validationErrors.length,
      cleanedRecords: validRecordsCount
    };

    const quality: DataQualityReport = {
      totalRecords: totalRawRecords,
      validRecords: validRecordsCount,
      invalidRecords: invalidRecordsCount,
      duplicateRecordsRemoved: transformed.cleanedMeta.droppedDuplicateRowsCount,
      emptyRowsRemoved: transformed.cleanedMeta.droppedEmptyRowsCount,
      validationErrors: transformed.validationErrors
    };

    return {
      statistics: stats,
      qualityReport: quality,
      processedData: rows
    };
  }
}
