import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { Purchase, PaginatedResponse, Store, Supplier } from '../core/models/models';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.scss'],
})
export class ComprasComponent implements OnInit {
  purchases: Purchase[] = [];
  stores: Store[] = [];
  suppliers: Supplier[] = [];
  loading = false;
  showForm = false;
  editingPurchase?: Purchase;
  page = 1;
  lastPage = 1;
  total = 0;

  filters = { store_id: '', month: '', year: new Date().getFullYear() };
  months = [
    { v: '1', l: 'Enero' }, { v: '2', l: 'Febrero' }, { v: '3', l: 'Marzo' },
    { v: '4', l: 'Abril' }, { v: '5', l: 'Mayo' }, { v: '6', l: 'Junio' },
    { v: '7', l: 'Julio' }, { v: '8', l: 'Agosto' }, { v: '9', l: 'Septiembre' },
    { v: '10', l: 'Octubre' }, { v: '11', l: 'Noviembre' }, { v: '12', l: 'Diciembre' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<Store[]>('stores').subscribe(s => this.stores = s);
    this.api.get<{ data: Supplier[] }>('suppliers').subscribe(r => this.suppliers = r.data);
    this.loadPurchases();
    window.addEventListener('yearChanged', (e: any) => {
      this.filters.year = e.detail;
      this.loadPurchases();
    });
  }

  loadPurchases(): void {
    this.loading = true;
    this.api.get<PaginatedResponse<Purchase>>('purchases', { ...this.filters, page: this.page }).subscribe({
      next: res => {
        this.purchases = res.data;
        this.lastPage  = res.last_page;
        this.total     = res.total;
        this.loading   = false;
      },
      error: () => { this.loading = false; }
    });
  }

  openForm(p?: Purchase): void { this.editingPurchase = p; this.showForm = true; }
  onSaved(): void { this.showForm = false; this.editingPurchase = undefined; this.loadPurchases(); }
  onCancelled(): void { this.showForm = false; this.editingPurchase = undefined; }

  delete(p: Purchase): void {
    if (!confirm(`¿Eliminar compra ${p.prefix}-${p.invoice_number}?`)) return;
    this.api.delete(`purchases/${p.id}`).subscribe(() => this.loadPurchases());
  }

  applyFilters(): void { this.page = 1; this.loadPurchases(); }
  clearFilters(): void { this.filters = { store_id: '', month: '', year: new Date().getFullYear() }; this.applyFilters(); }
  prevPage(): void { if (this.page > 1) { this.page--; this.loadPurchases(); } }
  nextPage(): void { if (this.page < this.lastPage) { this.page++; this.loadPurchases(); } }

  get currentTotalSubtotal(): number { return this.purchases.reduce((sum, p) => sum + Number(p.subtotal || 0), 0); }
  get currentTotalIva(): number { return this.purchases.reduce((sum, p) => sum + Number(p.tax_amount || 0), 0); }
  get currentTotal(): number { return this.purchases.reduce((sum, p) => sum + Number(p.total || 0), 0); }
  get currentTotalRetentions(): number { return this.purchases.reduce((sum, p) => sum + Number(p.total_retentions || 0), 0); }
  get currentTotalNetPaid(): number { return this.purchases.reduce((sum, p) => sum + Number(p.net_paid || 0), 0); }
}
