import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Expense {
  id?: number;
  expense_date: string;
  store_id: number;
  expense_category_id: number;
  amount: number;
  description?: string;
  reference_number?: string;
  category?: any;
  store?: any;
}

export interface ExpensesResponse {
  expenses: Expense[];
  total: string | number;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  getExpenses(filters?: any): Observable<ExpensesResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.store_id) params = params.set('store_id', filters.store_id);
      if (filters.date) params = params.set('date', filters.date);
      if (filters.start_date) params = params.set('start_date', filters.start_date);
      if (filters.end_date) params = params.set('end_date', filters.end_date);
    }
    return this.http.get<ExpensesResponse>(this.apiUrl, { params });
  }

  createExpense(expenseData: Expense): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, expenseData);
  }

  updateExpense(id: number, expenseData: Expense): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, expenseData);
  }

  deleteExpense(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

