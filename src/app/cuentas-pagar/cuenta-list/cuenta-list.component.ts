import { Component, OnInit } from '@angular/core';
import { AccountPayableService } from '../../core/services/account-payable/account-payable.service';
import { AccountPayable, Store, Supplier } from '../../core/models/models';
import { ApiService } from '../../core/services/api.service';
import { SupplierService } from '../../core/services/supplier/supplier.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cuenta-list',
  templateUrl: './cuenta-list.component.html',
  styleUrls: ['./cuenta-list.component.scss']
})
export class CuentaListComponent implements OnInit {
  accountPayables: AccountPayable[] = [];
  stores: Store[] = [];
  suppliers: Supplier[] = [];
  
  loading = false;
  showPaymentForm = false;
  showNewForm = false;
  selectedAccount?: AccountPayable;

  filters = {
    store_id: '',
    supplier_id: '',
    status: ''
  };

  totalDeuda = 0;
  totalAbonado = 0;
  totalSaldo = 0;

  constructor(
    private apService: AccountPayableService,
    private api: ApiService,
    private supplierService: SupplierService,
    public auth: AuthService
  ) {}

  get canEdit(): boolean {
    return !this.auth.isCashier;
  }

  ngOnInit(): void {
    this.loadFiltersData();
    this.loadAccountPayables();
  }

  loadFiltersData(): void {
    this.api.get<Store[]>('stores').subscribe(s => this.stores = s);
    this.supplierService.getSuppliers().subscribe(s => this.suppliers = (s as any).data ? (s as any).data : s);
  }

  loadAccountPayables(): void {
    this.loading = true;
    const activeFilters: any = {};
    if (this.filters.store_id) activeFilters.store_id = this.filters.store_id;
    if (this.filters.supplier_id) activeFilters.supplier_id = this.filters.supplier_id;
    if (this.filters.status) activeFilters.status = this.filters.status;

    this.apService.getAccountPayables(activeFilters).subscribe({
      next: (res) => {
        this.accountPayables = res;
        this.calculateTotals();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  calculateTotals(): void {
    this.totalDeuda = this.accountPayables.reduce((sum, item) => sum + Number(item.amount), 0);
    this.totalAbonado = this.accountPayables.reduce((sum, item) => sum + (Number(item.amount) - Number(item.balance)), 0);
    this.totalSaldo = this.accountPayables.reduce((sum, item) => sum + Number(item.balance), 0);
  }

  applyFilters(): void {
    this.loadAccountPayables();
  }

  clearFilters(): void {
    this.filters = { store_id: '', supplier_id: '', status: '' };
    this.loadAccountPayables();
  }

  openPaymentForm(account: AccountPayable): void {
    this.selectedAccount = account;
    this.showPaymentForm = true;
    this.showNewForm = false;
  }

  onPaymentSaved(): void {
    this.showPaymentForm = false;
    this.selectedAccount = undefined;
    this.loadAccountPayables();
  }

  onPaymentCancelled(): void {
    this.showPaymentForm = false;
    this.selectedAccount = undefined;
  }

  openNewForm(): void {
    this.showNewForm = true;
    this.showPaymentForm = false;
    this.selectedAccount = undefined;
  }

  onNewFormSaved(): void {
    this.showNewForm = false;
    this.loadAccountPayables();
  }

  onNewFormCancelled(): void {
    this.showNewForm = false;
  }
}
