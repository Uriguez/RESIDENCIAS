// utils/pdfExporter.ts
// Utilidad para exportar reportes a PDF - Simula funcionalidad de Crystal Reports Export
// MIGRACIÓN C#: Usar Crystal Reports SDK o iTextSharp/PdfSharp para generación de PDFs

import { ReportData, CrystalReportConfig } from '../types/reports';

export class PDFExporter {
  
  /**
   * Exporta un reporte a PDF
   * MIGRACIÓN C#: Implementar con Crystal Reports SDK o biblioteca PDF nativa
   */
  static async exportToPDF(
    reportData: ReportData,
    config: CrystalReportConfig
  ): Promise<void> {
    // En producción, aquí se usaría una librería como jsPDF o react-pdf
    // Para la demo, generamos un blob simulado
    
    const pdfContent = this.generatePDFContent(reportData, config);
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    
    // Trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportData.template.name}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Genera el contenido del PDF
   * MIGRACIÓN C#: Template personalizado con logo y formato Griver
   */
  private static generatePDFContent(
    reportData: ReportData,
    config: CrystalReportConfig
  ): string {
    // Simulación - En producción usaría jsPDF
    let content = `%PDF-1.4
%GRIVER REPORT SYSTEM
`;
    
    // Header
    if (config.showHeader) {
      content += `
========================================
SISTEMA GRIVER - GESTIÓN DE CURSOS
========================================
`;
    }

    if (config.showLogo) {
      content += `
[LOGO GRIVER]
`;
    }

    // Report Title
    content += `
REPORTE: ${reportData.template.name}
DESCRIPCIÓN: ${reportData.template.description}
GENERADO: ${new Date(reportData.generatedAt).toLocaleString('es-MX')}
GENERADO POR: ${reportData.generatedBy}
`;

    if (config.watermark) {
      content += `
WATERMARK: ${config.watermark}
`;
    }

    // Filters Applied
    content += `
----------------------------------------
FILTROS APLICADOS
----------------------------------------
`;
    if (reportData.filters.dateRange) {
      content += `Rango de Fechas: ${reportData.filters.dateRange.preset}
`;
    }
    if (reportData.filters.departments && reportData.filters.departments.length > 0) {
      content += `Departamentos: ${reportData.filters.departments.join(', ')}
`;
    }

    // Data Section
    content += `
----------------------------------------
DATOS DEL REPORTE
----------------------------------------
Total de Registros: ${reportData.summary?.totalRecords || 0}

`;

    // Table Headers
    const headers = reportData.template.fields.map(f => f.label).join(' | ');
    content += `${headers}
`;
    content += `${'-'.repeat(headers.length)}
`;

    // Table Rows (first 50 for demo)
    reportData.data.slice(0, 50).forEach(row => {
      const rowData = reportData.template.fields.map(field => {
        const value = row[field.key];
        if (typeof value === 'number' && field.type === 'percentage') {
          return `${value}%`;
        }
        return value || 'N/A';
      }).join(' | ');
      content += `${rowData}
`;
    });

    if (reportData.data.length > 50) {
      content += `
... y ${reportData.data.length - 50} registros más
`;
    }

    // Summary Section
    if (reportData.summary?.aggregations) {
      content += `
----------------------------------------
RESUMEN Y ESTADÍSTICAS
----------------------------------------
`;
      Object.entries(reportData.summary.aggregations).forEach(([key, value]) => {
        content += `${key}: ${value}
`;
      });
    }

    // Footer
    if (config.showFooter) {
      content += `
----------------------------------------
Griver © ${new Date().getFullYear()} - Sistema de Gestión de Cursos
`;
      if (config.showPageNumbers) {
        content += `Página 1 de 1
`;
      }
      if (config.showGenerationDate) {
        content += `Fecha de Generación: ${new Date().toLocaleString('es-MX')}
`;
      }
    }

    content += `
%%EOF`;

    return content;
  }

  /**
   * Imprime el reporte directamente
   * MIGRACIÓN C#: Usar PrintDocument de .NET
   */
  static async printReport(
    reportData: ReportData,
    config: CrystalReportConfig
  ): Promise<void> {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('No se pudo abrir la ventana de impresión');
    }

    const htmlContent = this.generatePrintHTML(reportData, config);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  }

  /**
   * Genera HTML para impresión
   */
  private static generatePrintHTML(
    reportData: ReportData,
    config: CrystalReportConfig
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${reportData.template.name}</title>
  <style>
    @page {
      size: ${config.pageSize} ${config.orientation};
      margin: 2cm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #1a365d;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .logo {
      font-size: 18pt;
      font-weight: bold;
      color: #1a365d;
      margin-bottom: 5px;
    }
    .report-title {
      font-size: 14pt;
      font-weight: bold;
      margin: 10px 0;
    }
    .meta-info {
      font-size: 9pt;
      color: #666;
      margin-bottom: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 9pt;
    }
    th {
      background-color: #1a365d;
      color: white;
      padding: 8px;
      text-align: left;
      font-weight: bold;
    }
    td {
      padding: 6px 8px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .summary {
      background-color: #f0f4f8;
      padding: 15px;
      margin-top: 20px;
      border-left: 4px solid #1a365d;
    }
    .footer {
      text-align: center;
      font-size: 8pt;
      color: #666;
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
    }
    ${config.watermark ? `
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 72pt;
      color: rgba(0,0,0,0.05);
      z-index: -1;
    }
    ` : ''}
  </style>
</head>
<body>
  ${config.watermark ? `<div class="watermark">${config.watermark}</div>` : ''}
  
  ${config.showHeader ? `
  <div class="header">
    ${config.showLogo ? '<div class="logo">GRIVER</div>' : ''}
    <div class="report-title">${reportData.template.name}</div>
    <div class="meta-info">
      ${reportData.template.description}<br>
      Generado: ${new Date(reportData.generatedAt).toLocaleString('es-MX')} | 
      Por: ${reportData.generatedBy}
    </div>
  </div>
  ` : ''}

  <table>
    <thead>
      <tr>
        ${reportData.template.fields.map(f => `<th>${f.label}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${reportData.data.map(row => `
        <tr>
          ${reportData.template.fields.map(field => {
            let value = row[field.key];
            if (typeof value === 'number' && field.type === 'percentage') {
              value = `${value}%`;
            }
            return `<td>${value || 'N/A'}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>

  ${reportData.summary ? `
  <div class="summary">
    <strong>RESUMEN:</strong><br>
    Total de Registros: ${reportData.summary.totalRecords}<br>
    ${Object.entries(reportData.summary.aggregations).map(([key, value]) => 
      `${key}: ${value}`
    ).join('<br>')}
  </div>
  ` : ''}

  ${config.showFooter ? `
  <div class="footer">
    Griver © ${new Date().getFullYear()} - Sistema de Gestión de Cursos
    ${config.showPageNumbers ? ' | Página 1' : ''}
    ${config.showGenerationDate ? ` | ${new Date().toLocaleDateString('es-MX')}` : ''}
  </div>
  ` : ''}
</body>
</html>
    `;
  }
}

// MIGRACIÓN C#:
// - Implementar clase PdfExportService
// - Usar Crystal Reports .NET SDK para exportación nativa
// - Alternativa: iTextSharp o PdfSharp para mayor control
// - Implementar templates personalizables desde base de datos
// - Añadir firma digital a PDFs si es requerido
