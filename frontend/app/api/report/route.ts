import { NextResponse } from 'next/server';
import { DatasetRepository } from '@/lib/repositories/dataset.repository';

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

    let payload = null;
    let filename = '';

    if (type === 'quality') {
      payload = dataset.qualityReport;
      filename = `quality-report-${dataset.filename}.json`;
    } else if (type === 'stats') {
      payload = dataset.statistics;
      filename = `statistics-${dataset.filename}.json`;
    } else {
      return new NextResponse('Invalid type parameter', { status: 400 });
    }

    if (!payload) {
      return new NextResponse('Report data not found', { status: 404 });
    }

    const jsonString = JSON.stringify(payload, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Report API Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
