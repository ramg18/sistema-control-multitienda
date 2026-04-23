import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { ReportService } from '../core/services/report.service';
import { 
  Store, 
  ProfitAndLossReport,
  CashFlowReport,
  TaxesReport,
  ArApReport,
  SellerPerformanceReport
} from '../core/models/models';

@Component({
  selector: 'app-analitica',
  templateUrl: './analitica.component.html',
  styleUrls: ['./analitica.component.scss']
})
export class AnaliticaComponent implements OnInit {
  stores: Store[] = [];
  
  startDate: string = '';
  endDate: string = '';
  storeId: string = ''; // '' significa todas las tiendas

  activeTab: 'pyg' | 'flujo' | 'impuestos' | 'cartera' | 'rendimiento' = 'pyg';
  loading = false;

  pygReport?: ProfitAndLossReport;
  cashFlowReport?: CashFlowReport;
  taxesReport?: TaxesReport;
  arApReport?: ArApReport;
  sellerReport?: SellerPerformanceReport;

  constructor(private api: ApiService, private reportService: ReportService) {
      const year = new Date().getFullYear();
      this.startDate = `${year}-01-01`;
      this.endDate = `${year}-12-31`;
  }

  ngOnInit() {
    this.api.get<Store[]>('stores').subscribe(s => this.stores = s);
    this.loadData();
  }

  loadData() {
    this.loading = true;
    const store_id = this.storeId ? Number(this.storeId) : undefined;
    
    if (this.activeTab === 'pyg') {
      this.reportService.getProfitAndLoss(this.startDate, this.endDate, store_id)
        .subscribe(r => { this.pygReport = r; this.loading = false; }, () => this.loading = false);
    } else if (this.activeTab === 'flujo') {
      this.reportService.getCashFlow(this.startDate, this.endDate, store_id)
        .subscribe(r => { this.cashFlowReport = r; this.loading = false; }, () => this.loading = false);
    } else if (this.activeTab === 'impuestos') {
      this.reportService.getTaxes(this.startDate, this.endDate, store_id)
        .subscribe(r => { this.taxesReport = r; this.loading = false; }, () => this.loading = false);
    } else if (this.activeTab === 'cartera') {
      this.reportService.getArAp(store_id)
        .subscribe(r => { this.arApReport = r; this.loading = false; }, () => this.loading = false);
    } else if (this.activeTab === 'rendimiento') {
      this.reportService.getSellerPerformance(this.startDate, this.endDate, store_id)
        .subscribe(r => { this.sellerReport = r; this.loading = false; }, () => this.loading = false);
    }
  }

  switchTab(tab: 'pyg' | 'flujo' | 'impuestos' | 'cartera' | 'rendimiento') {
    this.activeTab = tab;
    this.loadData();
  }
}
