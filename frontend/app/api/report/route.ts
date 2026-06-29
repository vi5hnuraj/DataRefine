import { NextResponse } from 'next/server';
import { DatasetRepository } from '@/lib/repositories/dataset.repository';
import Papa from 'papaparse';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  if (!id || !type) {
    return new NextResponse('Missing id or type parameter', { status: 400 });
  }

  try {
    const dataset = await DatasetRepository.getDatasetResults(id);
    if (!dataset) {
      return new NextResponse('Dataset not found', { status: 404 });
    }

    let responseData = '';
    let filename = '';
    let contentType = 'application/json';

    if (type === 'quality') {
      const qualityReport = dataset.qualityReport;
      
      // Convert validation errors array directly to CSV
      if (qualityReport && qualityReport.validationErrors && qualityReport.validationErrors.length > 0) {
        responseData = Papa.unparse(qualityReport.validationErrors);
      } else {
        responseData = "No validation errors found in this dataset.";
      }
      
      filename = `quality-report-${dataset.filename}.csv`;
      contentType = 'text/csv';
    } else if (type === 'stats') {
      if (!dataset.statistics) {
        return new NextResponse('Report data not found', { status: 404 });
      }
      responseData = JSON.stringify(dataset.statistics, null, 2);
      filename = `statistics-${dataset.filename}.json`;
    } else {
      return new NextResponse('Invalid type parameter', { status: 400 });
    }

    return new NextResponse(responseData, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('Report API Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
