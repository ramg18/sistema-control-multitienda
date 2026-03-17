import { Component, OnInit } from '@angular/core';
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
}
