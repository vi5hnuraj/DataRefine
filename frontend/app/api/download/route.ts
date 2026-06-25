import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { basename } from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'eu-north-1' });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return new NextResponse('Missing path parameter', { status: 400 });
  }

  try {
    if (path.startsWith('s3://')) {
      const [bucket, ...keyParts] = path.replace('s3://', '').split('/');
      const key = keyParts.join('/');
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return NextResponse.redirect(signedUrl);
    }

    if (!existsSync(path)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = readFileSync(path);
    const filename = basename(path);

    const isJson = filename.endsWith('.json');
    const contentType = isJson ? 'application/json' : 'text/csv';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('Download Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
