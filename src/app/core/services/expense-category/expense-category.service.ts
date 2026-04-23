import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ExpenseCategory {
  id?: number;
  name: string;
  description?: string;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseCategoryService {
  private apiUrl = `${environment.apiUrl}/expense-categories`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<ExpenseCategory[]> {
    return this.http.get<ExpenseCategory[]>(this.apiUrl);
  }

  createCategory(categoryData: ExpenseCategory): Observable<ExpenseCategory> {
    return this.http.post<ExpenseCategory>(this.apiUrl, categoryData);
  }
}

