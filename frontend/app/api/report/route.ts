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

    let responseData = '';
    let filename = '';
    let contentType = 'application/json';

    if (type === 'quality') {
      const quality = dataset.qualityReport || {};
      const stats = dataset.statistics || {};
      const errors = quality.validationErrors || [];
      
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Quality Report - ${dataset.filename}</title>
    <style>
        :root {
            --bg-color: #f8fafc;
            --card-bg: #ffffff;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --primary: #3b82f6;
            --border: #e2e8f0;
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-main);
            line-height: 1.5;
            margin: 0;
            padding: 40px 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        .header {
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            color: var(--text-main);
        }
        .header p {
            margin: 5px 0 0;
            color: var(--text-muted);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: var(--card-bg);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            border: 1px solid var(--border);
            text-align: center;
        }
        .stat-value {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 14px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .table-container {
            background: var(--card-bg);
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            border: 1px solid var(--border);
            overflow: hidden;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }
        th {
            background-color: #f1f5f9;
            padding: 12px 20px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
            border-bottom: 2px solid var(--border);
        }
        td {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
            font-size: 14px;
        }
        tr:last-child td {
            border-bottom: none;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 500;
            background: #fee2e2;
            color: var(--error);
            border: 1px solid #fca5a5;
        }
        .empty-state {
            padding: 40px;
            text-align: center;
            color: var(--text-muted);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Data Quality Report</h1>
            <p>Dataset: <strong>${dataset.filename}</strong></p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value text-primary">${stats.totalRecords || 0}</div>
                <div class="stat-label">Total Rows</div>
            </div>
            <div class="stat-card">
                <div class="stat-value text-success">${stats.validRecords || 0}</div>
                <div class="stat-label">Clean Rows</div>
            </div>
            <div class="stat-card">
                <div class="stat-value text-error">${stats.invalidRecords || 0}</div>
                <div class="stat-label">Validation Errors</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: var(--warning);">${stats.duplicateRecords || 0}</div>
                <div class="stat-label">Duplicates Removed</div>
            </div>
        </div>

        <h2 style="font-size: 20px; margin-bottom: 15px;">Validation Error Details</h2>
        <div class="table-container">
            ${errors.length > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>Row #</th>
                        <th>Column</th>
                        <th>Error Type</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    ${errors.map((err: any) => `
                    <tr>
                        <td style="font-family: monospace; color: var(--text-muted);">${(err.row ?? err.rowIndex ?? 0) + 1}</td>
                        <td style="font-weight: 500; color: var(--primary);">${err.column}</td>
                        <td><span class="badge">${err.errorType}</span></td>
                        <td>${err.message}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 10px; color: var(--success);"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <h3>Perfect Data Health!</h3>
                <p>No validation errors were found in this dataset.</p>
            </div>
            `}
        </div>
    </div>
</body>
</html>
      `;
      
      responseData = htmlContent;
      filename = `quality-report-${dataset.filename}.html`;
      contentType = 'text/html';
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
