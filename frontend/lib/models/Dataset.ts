import mongoose, { Schema, Document } from 'mongoose';

export enum PipelineStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface IPipelineRun extends Document {
  datasetId: mongoose.Types.ObjectId;
  stage: string;
  status: PipelineStatus;
  logs?: string;
  startedAt: Date;
  completedAt?: Date;
}

const PipelineRunSchema = new Schema({
  datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true },
  stage: { type: String, required: true },
  status: { type: String, enum: Object.values(PipelineStatus), required: true },
  logs: { type: String },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export interface IDatasetStatistics extends Document {
  datasetId: mongoose.Types.ObjectId;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  nullValues: number;
  numericColumns: any;
  processingTimeMs: number;
  processingStatus: string;
  validationErrorCount: number;
  cleanedRecords: number;
}

const DatasetStatisticsSchema = new Schema({
  datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true, unique: true },
  totalRecords: { type: Number, required: true },
  validRecords: { type: Number, required: true },
  invalidRecords: { type: Number, required: true },
  duplicateRecords: { type: Number, required: true },
  nullValues: { type: Number, required: true },
  numericColumns: { type: Schema.Types.Mixed, required: true },
  processingTimeMs: { type: Number, required: true },
  processingStatus: { type: String, required: true },
  validationErrorCount: { type: Number, required: true },
  cleanedRecords: { type: Number, required: true }
});

export interface IDataQualityReport extends Document {
  datasetId: mongoose.Types.ObjectId;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecordsRemoved: number;
  emptyRowsRemoved: number;
  validationErrors: any;
}

const DataQualityReportSchema = new Schema({
  datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true, unique: true },
  totalRecords: { type: Number, required: true },
  validRecords: { type: Number, required: true },
  invalidRecords: { type: Number, required: true },
  duplicateRecordsRemoved: { type: Number, required: true },
  emptyRowsRemoved: { type: Number, required: true },
  validationErrors: { type: Schema.Types.Mixed, required: true }
});

export interface IProcessedFile extends Document {
  datasetId: mongoose.Types.ObjectId;
  filename: string;
  format: string;
  storageUrl: string;
  createdAt: Date;
}

const ProcessedFileSchema = new Schema({
  datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true, unique: true },
  filename: { type: String, required: true },
  format: { type: String, required: true },
  storageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export interface IAiAuditorReport extends Document {
  datasetId: mongoose.Types.ObjectId;
  executiveSummary: string;
  dataQualityAssessment: string;
  keyRisks: string[];
  recommendations: string[];
  productionReadiness: string;
  aiQualityScore: number;
  confidenceScore: number;
  generatedAt: Date;
}

const AiAuditorReportSchema = new Schema({
  datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset', required: true, unique: true },
  executiveSummary: { type: String, required: true },
  dataQualityAssessment: { type: String, required: true },
  keyRisks: { type: [String], default: [] },
  recommendations: { type: [String], default: [] },
  productionReadiness: { type: String, required: true },
  aiQualityScore: { type: Number, required: true },
  confidenceScore: { type: Number, default: 0 },
  generatedAt: { type: Date, default: Date.now }
});

export interface IDataset extends Document {
  userId?: mongoose.Types.ObjectId;
  filename: string;
  originalSize: number;
  status: PipelineStatus;
  format: string;
  storageUrl: string;
  createdAt: Date;
}

const DatasetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  filename: { type: String, required: true },
  originalSize: { type: Number, required: true },
  status: { type: String, enum: Object.values(PipelineStatus), default: PipelineStatus.PENDING, index: true },
  format: { type: String, required: true },
  storageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Configure schemas to return 'id' instead of '_id' and '__v' when converted to JSON.
const transformJSON = {
  virtuals: true,
  versionKey: false,
  transform: (doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
  }
};

PipelineRunSchema.set('toJSON', transformJSON);
DatasetStatisticsSchema.set('toJSON', transformJSON);
DataQualityReportSchema.set('toJSON', transformJSON);
ProcessedFileSchema.set('toJSON', transformJSON);
DatasetSchema.set('toJSON', transformJSON);
AiAuditorReportSchema.set('toJSON', transformJSON);

DatasetSchema.virtual('runs', {
  ref: 'PipelineRun',
  localField: '_id',
  foreignField: 'datasetId'
});

DatasetSchema.virtual('statistics', {
  ref: 'DatasetStatistics',
  localField: '_id',
  foreignField: 'datasetId',
  justOne: true
});

DatasetSchema.virtual('qualityReport', {
  ref: 'DataQualityReport',
  localField: '_id',
  foreignField: 'datasetId',
  justOne: true
});

DatasetSchema.virtual('processedFile', {
  ref: 'ProcessedFile',
  localField: '_id',
  foreignField: 'datasetId',
  justOne: true
});

DatasetSchema.virtual('aiReport', {
  ref: 'AiAuditorReport',
  localField: '_id',
  foreignField: 'datasetId',
  justOne: true
});

DatasetSchema.set('toObject', { virtuals: true });

export const PipelineRun = mongoose.models.PipelineRun || mongoose.model<IPipelineRun>('PipelineRun', PipelineRunSchema);
export const DatasetStatistics = mongoose.models.DatasetStatistics || mongoose.model<IDatasetStatistics>('DatasetStatistics', DatasetStatisticsSchema);
export const DataQualityReport = mongoose.models.DataQualityReport || mongoose.model<IDataQualityReport>('DataQualityReport', DataQualityReportSchema);
export const ProcessedFile = mongoose.models.ProcessedFile || mongoose.model<IProcessedFile>('ProcessedFile', ProcessedFileSchema);
export const AiAuditorReport = mongoose.models.AiAuditorReport || mongoose.model<IAiAuditorReport>('AiAuditorReport', AiAuditorReportSchema);
export const Dataset = mongoose.models.Dataset || mongoose.model<IDataset>('Dataset', DatasetSchema);
