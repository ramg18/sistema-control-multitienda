import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AccountPayable } from '../../models/models';

@Injectable({
  providedIn: 'root'
})
export class AccountPayableService {
  private apiUrl = `${environment.apiUrl}/account-payables`;

  constructor(private http: HttpClient) { }

  getAccountPayables(filters?: { store_id?: number, supplier_id?: number, status?: string }): Observable<AccountPayable[]> {
    let params = new HttpParams();
    if (filters?.store_id) params = params.set('store_id', filters.store_id);
    if (filters?.supplier_id) params = params.set('supplier_id', filters.supplier_id);
    if (filters?.status) params = params.set('status', filters.status);
    
    return this.http.get<AccountPayable[]>(this.apiUrl, { params });
  }

  getAccountPayable(id: number): Observable<AccountPayable> {
    return this.http.get<AccountPayable>(`${this.apiUrl}/${id}`);
  }

  createAccountPayable(ap: AccountPayable): Observable<AccountPayable> {
    return this.http.post<AccountPayable>(this.apiUrl, ap);
  }

  updateAccountPayable(id: number, ap: Partial<AccountPayable>): Observable<AccountPayable> {
    return this.http.put<AccountPayable>(`${this.apiUrl}/${id}`, ap);
  }

  deleteAccountPayable(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
