export interface ExtractedData {
  rows: Record<string, any>[];
  headers: string[];
  totalRawRows: number;
}

export interface ValidationError {
  row: number;
  column: string;
  errorType: 'MISSING_VALUE' | 'INVALID_NUMERIC' | 'INVALID_DATE' | 'SCHEMA_MISMATCH';
  message?: string;
}

export interface ValidationResult {
  rows: Record<string, any>[];
  errors: ValidationError[];
  isValid: boolean;
}

export interface CleanedResult {
  rows: Record<string, any>[];
  droppedEmptyRowsCount: number;
  droppedDuplicateRowsCount: number;
  nullValuesStandardizedCount: number;
  validationErrors: ValidationError[]; // Carry over for stats
}

export interface TransformedResult {
  rows: Record<string, any>[];
  columns: Record<string, 'string' | 'number' | 'date' | 'boolean'>;
  validationErrors: ValidationError[];
  cleanedMeta: {
    droppedEmptyRowsCount: number;
    droppedDuplicateRowsCount: number;
    nullValuesStandardizedCount: number;
  };
}

export interface ColumnStats {
  min: number | null;
  max: number | null;
  avg: number | null;
}

export interface DatasetStatistics {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  nullValues: number;
  numericColumns: Record<string, ColumnStats>;
  processingTimeMs: number;
  processingStatus: "SUCCESS" | "FAILED";
  validationErrorCount: number;
  cleanedRecords: number;
}

export interface DataQualityReport {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecordsRemoved: number;
  emptyRowsRemoved: number;
  validationErrors: ValidationError[];
}

export interface FinalETLOutput {
  statistics: DatasetStatistics;
  qualityReport: DataQualityReport;
  processedData: Record<string, any>[];
}
