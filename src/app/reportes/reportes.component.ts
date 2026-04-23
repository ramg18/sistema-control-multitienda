import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../core/services/api.service';
import { MonthReport, Store } from '../core/models/models';

export interface PurchaseStoreReport {
  store_id: number;
  name: string;
  code: string;
  subtotal: number;
  tax: number;
  total: number;
  part_percent: number;
}

export interface PurchaseReport {
  year: number;
  stores: PurchaseStoreReport[];
  summary: {
    subtotal: number;
    tax: number;
    total: number;
  };
}

export interface BimesterReport {
  bimester: number;
  name: string;
  stores: Record<string, number>;
  percentages: Record<string, number>;
  consolidated: number;
  variation: number | null;
  prom_day: number;
}

export interface BimonthlySales {
  year: number;
  bimesters: BimesterReport[];
  summary: {
    stores: Record<string, number>;
    consolidated: number;
    percentages: Record<string, number>;
    prom_day: number;
  };
}

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
})
export class ReportesComponent implements OnInit {
  salesReport: MonthReport[]     = [];
  purchasesReport?: PurchaseReport;
  bimonthlyReport?: BimonthlySales;
  stores: Store[] = [];
  year     = new Date().getFullYear();
  loading  = false;
  activeTab: 'ventas' | 'bimensual' | 'compras' = 'ventas';

  // Export filters
  exportMonth: number | null = null;
  exportStoreId: number | null = null;
  exportLoading = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<Store[]>('stores').subscribe(s => this.stores = s);
    this.load();
    window.addEventListener('yearChanged', (e: any) => { this.year = e.detail; this.load(); });
  }

  load(): void {
    this.loading = true;
    this.api.get<{ year: number; months: MonthReport[] }>('reports/sales',    { year: this.year })
      .subscribe(r => this.salesReport = r.months);

    this.api.get<PurchaseReport>('reports/purchases', { year: this.year })
      .subscribe(r => { this.purchasesReport = r; });

    this.api.get<BimonthlySales>('reports/bimonthly-sales', { year: this.year })
      .subscribe(r => { this.bimonthlyReport = r; this.loading = false; });
  }

  getTotalByStore(report: MonthReport[], code: string): number {
    return report.reduce((acc, m) => acc + (m.stores[code]?.total ?? 0), 0);
  }

  getGrandTotal(report: MonthReport[]): number {
    return report.reduce((acc, m) => acc + m.consolidated, 0);
  }

  exportExcel(): void {
    this.exportLoading = true;

    const params: Record<string, any> = { year: this.year };
    if (this.exportMonth) params['month'] = this.exportMonth;
    if (this.exportStoreId) params['store_id'] = this.exportStoreId;

    this.api.get<{ data: any[]; total: number }>('reports/sales-detail-export', params)
      .subscribe({
        next: (res) => {
          this.generateXlsx(res.data);
          this.exportLoading = false;
        },
        error: () => {
          this.exportLoading = false;
        }
      });
  }

  private generateXlsx(rows: any[]): void {
    const headers = [
      'ID', 'Fecha', 'Tienda', 'Código Tienda', 'Prefijo', 'Número Doc',
      'Cliente', 'Total con IVA', 'Base Gravable', 'IVA', 'Operaciones',
      'Efectivo', 'Transferencia', 'T. Débito', 'T. Crédito', 'Crédito/Fiado',
      'Vale', 'Observaciones', 'Fuente'
    ];

    const dataRows = rows.map(r => [
      r.id,
      r.fecha,
      r.tienda,
      r.codigo_tienda,
      r.prefijo,
      r.numero,
      r.cliente,
      r.total_con_iva,
      r.base_gravable,
      r.iva,
      r.operaciones,
      r.efectivo,
      r.transferencia,
      r.tarjeta_debito,
      r.tarjeta_credito,
      r.credito_fiado,
      r.vale,
      r.observaciones,
      r.fuente,
    ]);

    const wsData = [headers, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws['!cols'] = [
      { wch: 6 }, { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
      { wch: 15 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 14 },
      { wch: 10 }, { wch: 25 }, { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas Detalladas');

    const monthLabel = this.exportMonth ? `_${MONTH_NAMES[this.exportMonth]}` : '';
    const store = this.exportStoreId ? this.stores.find(s => s.id === this.exportStoreId) : null;
    const storeLabel = store ? `_${store.code}` : '';
    const filename = `Ventas_${this.year}${monthLabel}${storeLabel}.xlsx`;

    XLSX.writeFile(wb, filename);
  }
}
