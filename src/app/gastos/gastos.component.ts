import { Component, OnInit } from '@angular/core';
import { ExpenseService, Expense, ExpensesResponse } from '../core/services/expense/expense.service';
import { ExpenseCategoryService, ExpenseCategory } from '../core/services/expense-category/expense-category.service';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';
import { Store } from '../core/models/models';

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.scss']
})
export class GastosComponent implements OnInit {
  expenses: Expense[] = [];
  stores: Store[] = [];
  categories: ExpenseCategory[] = [];
  
  loading = false;
  showForm = false;
  editingExpense?: Expense;
  
  totalAmount = 0;

  filters = {
    store_id: '',
    month: '',
    year: new Date().getFullYear()
  };

  months = [
    { v: '1', l: 'Enero' }, { v: '2', l: 'Febrero' }, { v: '3', l: 'Marzo' },
    { v: '4', l: 'Abril' }, { v: '5', l: 'Mayo' }, { v: '6', l: 'Junio' },
    { v: '7', l: 'Julio' }, { v: '8', l: 'Agosto' }, { v: '9', l: 'Septiembre' },
    { v: '10', l: 'Octubre' }, { v: '11', l: 'Noviembre' }, { v: '12', l: 'Diciembre' }
  ];

  constructor(
    private expenseService: ExpenseService,
    private categoryService: ExpenseCategoryService,
    private api: ApiService,
    public auth: AuthService
  ) {}

  get canEdit(): boolean {
    return !this.auth.isCashier;
  }

  ngOnInit(): void {
    this.loadCatalogs();
    
    // Set current month
    this.filters.month = (new Date().getMonth() + 1).toString();
    this.loadExpenses();

    window.addEventListener('yearChanged', (e: any) => {
      this.filters.year = e.detail;
      this.loadExpenses();
    });
  }

  loadCatalogs(): void {
    this.api.get<Store[]>('stores').subscribe(s => this.stores = s);
    this.categoryService.getCategories().subscribe(c => this.categories = c);
  }

  loadExpenses(): void {
    this.loading = true;
    
    let start_date = '';
    let end_date = '';
    
    if (this.filters.month && this.filters.year) {
      const year = this.filters.year;
      const month = parseInt(this.filters.month, 10);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0); // Last day of month
      
      start_date = `${year}-${month.toString().padStart(2, '0')}-01`;
      end_date = `${year}-${month.toString().padStart(2, '0')}-${end.getDate().toString().padStart(2, '0')}`;
    }

    const searchFilters: any = {};
    if (this.filters.store_id) searchFilters.store_id = this.filters.store_id;
    if (start_date && end_date) {
      searchFilters.start_date = start_date;
      searchFilters.end_date = end_date;
    }

    this.expenseService.getExpenses(searchFilters).subscribe({
      next: (res: ExpensesResponse) => {
        this.expenses = res.expenses;
        this.totalAmount = Number(res.total) || 0;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    this.loadExpenses();
  }

  clearFilters(): void {
    this.filters.store_id = '';
    this.filters.month = '';
    this.loadExpenses();
  }

  openForm(expense?: Expense): void {
    this.editingExpense = expense;
    this.showForm = true;
  }

  onFormSaved(): void {
    this.showForm = false;
    this.editingExpense = undefined;
    this.loadExpenses();
  }

  onFormCancelled(): void {
    this.showForm = false;
    this.editingExpense = undefined;
  }

  deleteExpense(id: number | undefined): void {
    if (!id || !confirm('¿Estás seguro de eliminar este gasto?')) return;
    
    this.expenseService.deleteExpense(id).subscribe({
      next: () => this.loadExpenses(),
      error: (err) => alert('Error al eliminar: ' + (err.error?.message || ''))
    });
  }
}
