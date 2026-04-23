import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';
import { Sale, PaginatedResponse, Store, TaxRate } from '../core/models/models';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss'],
})
export class VentasComponent implements OnInit {
  sales: Sale[] = [];
  stores: Store[] = [];
  taxRates: TaxRate[] = [];
  loading = false;
  showForm = false;
  editingSale?: Sale;
  page = 1;
  lastPage = 1;
  total = 0;

  filters = {
    store_id: '',
    month: '',
    year: new Date().getFullYear(),
    payment_method: '',
  };

  months = [
    { v: '1', l: 'Enero' }, { v: '2', l: 'Febrero' }, { v: '3', l: 'Marzo' },
    { v: '4', l: 'Abril' }, { v: '5', l: 'Mayo' }, { v: '6', l: 'Junio' },
    { v: '7', l: 'Julio' }, { v: '8', l: 'Agosto' }, { v: '9', l: 'Septiembre' },
    { v: '10', l: 'Octubre' }, { v: '11', l: 'Noviembre' }, { v: '12', l: 'Diciembre' },
  ];

  paymentMethods = [
    { v: 'EF', l: 'Efectivo' }, { v: 'CF', l: 'Crédito/Fiado' },
    { v: 'TR', l: 'Transferencia' }, { v: 'TD', l: 'Débito' },
    { v: 'TC', l: 'T. Crédito' }, { v: 'VA', l: 'Vale' },
  ];

  constructor(private api: ApiService, private auth: AuthService) {}

  get canEdit(): boolean {
    return !this.auth.isCashier;
  }

  get pageTotals() {
    return this.sales.reduce((acc, s) => {
      acc.total += Number(s.total_with_tax) || 0;
      acc.tax += Number(s.tax_amount) || 0;
      acc.base += Number(s.taxable_base) || 0;
      acc.ops += Number(s.operations_count) || 0;
      return acc;
    }, { total: 0, tax: 0, base: 0, ops: 0 });
  }

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadSales();
    window.addEventListener('yearChanged', (e: any) => {
      this.filters.year = e.detail;
      this.loadSales();
    });
  }

  loadCatalogs(): void {
    this.api.get<Store[]>('stores').subscribe(s => this.stores = s);
    this.api.get<TaxRate[]>('tax-rates').subscribe(r => this.taxRates = r);
  }

  loadSales(): void {
    this.loading = true;
    this.api.get<PaginatedResponse<Sale>>('sales', { ...this.filters, page: this.page }).subscribe({
      next: res => {
        this.sales    = res.data;
        this.lastPage = res.last_page;
        this.total    = res.total;
        this.loading  = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openForm(sale?: Sale): void {
    this.editingSale = sale;
    this.showForm    = true;
  }

  onFormSaved(): void {
    this.showForm    = false;
    this.editingSale = undefined;
    this.loadSales();
  }

  onFormCancelled(): void {
    this.showForm    = false;
    this.editingSale = undefined;
  }

  deleteSale(sale: Sale): void {
    if (!confirm(`¿Eliminar venta ${sale.prefix}-${sale.doc_number}?`)) return;
    this.api.delete(`sales/${sale.id}`).subscribe(() => this.loadSales());
  }

  applyFilters(): void {
    this.page = 1;
    this.loadSales();
  }

  clearFilters(): void {
    this.filters = { store_id: '', month: '', year: new Date().getFullYear(), payment_method: '' };
    this.applyFilters();
  }

  prevPage(): void { if (this.page > 1) { this.page--; this.loadSales(); } }
  nextPage(): void { if (this.page < this.lastPage) { this.page++; this.loadSales(); } }

  exportLoading = false;

  exportExcel(): void {
    this.exportLoading = true;
    const params: Record<string, any> = { year: this.filters.year };
    if (this.filters.store_id) params['store_id'] = this.filters.store_id;
    if (this.filters.month)    params['month']    = this.filters.month;

    this.api.get<{ data: any[] }>('reports/sales-detail-export', params).subscribe({
      next: (res) => {
        const headers = [
          'ID', 'Fecha', 'Tienda', 'Código', 'Prefijo', 'Número Doc', 'Cliente',
          'Total c/IVA', 'Base Gravable', 'IVA', 'Operaciones',
          'Efectivo', 'Transferencia', 'T. Débito', 'T. Crédito', 'Crédito/Fiado', 'Vale',
          'Observaciones', 'Fuente',
        ];
        const rows = res.data.map(r => [
          r.id, r.fecha, r.tienda, r.codigo_tienda, r.prefijo, r.numero, r.cliente,
          r.total_con_iva, r.base_gravable, r.iva, r.operaciones,
          r.efectivo, r.transferencia, r.tarjeta_debito, r.tarjeta_credito, r.credito_fiado, r.vale,
          r.observaciones, r.fuente,
        ]);
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = [
          {wch:6},{wch:12},{wch:20},{wch:8},{wch:10},{wch:12},{wch:14},
          {wch:14},{wch:14},{wch:12},{wch:10},
          {wch:12},{wch:14},{wch:12},{wch:14},{wch:14},{wch:10},
          {wch:25},{wch:10},
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
        const store = this.stores.find(s => String(s.id) === String(this.filters.store_id));
        const monthNames = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        const monthPart = this.filters.month ? `_${monthNames[+this.filters.month]}` : '';
        const storePart = store ? `_${store.code}` : '';
        XLSX.writeFile(wb, `Ventas_${this.filters.year}${monthPart}${storePart}.xlsx`);
        this.exportLoading = false;
      },
      error: () => { this.exportLoading = false; }
    });
  }

  get currentTotalWithTax(): number { return this.sales.reduce((sum, s) => sum + Number(s.total_with_tax || 0), 0); }
  get currentTotalIva(): number { return this.sales.reduce((sum, s) => sum + Number(s.tax_amount || 0), 0); }
  get currentTotalBase(): number { return this.sales.reduce((sum, s) => sum + Number(s.taxable_base || 0), 0); }
  get currentTotalOps(): number { return this.sales.reduce((sum, s) => sum + Number(s.operations_count || 0), 0); }
}
