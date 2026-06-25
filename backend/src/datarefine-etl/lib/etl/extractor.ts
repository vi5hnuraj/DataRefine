import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ExtractedData } from './types';

export class Extractor {
  /**
   * Extracts data from a raw string or buffer into standardized JSON
   */
  static extractCsv(csvString: string): ExtractedData {
    const parsed = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: false,
    });

    const rows = parsed.data as Record<string, any>[];
    return {
      rows,
      headers: parsed.meta.fields || [],
      totalRawRows: rows.length,
    };
  }

  static extractJson(jsonString: string): ExtractedData {
    try {
      const data = JSON.parse(jsonString);
      const rows = Array.isArray(data) ? data : [data];
      
      const headers = new Set<string>();
      rows.forEach(row => {
        if (typeof row === 'object' && row !== null) {
          Object.keys(row).forEach(k => headers.add(k));
        }
      });

      return {
        rows,
        headers: Array.from(headers),
        totalRawRows: rows.length,
      };
    } catch (e) {
      throw new Error("Invalid JSON data format");
    }
  }

  static extractExcel(buffer: Buffer): ExtractedData {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as Record<string, any>[];
    
    const headers = new Set<string>();
    if (rows.length > 0) {
      Object.keys(rows[0]).forEach(k => headers.add(k));
    }

    return {
      rows,
      headers: Array.from(headers),
      totalRawRows: rows.length,
    };
  }
}
