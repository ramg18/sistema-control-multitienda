import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApPayment } from '../../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApPaymentService {
  private apiUrl = `${environment.apiUrl}/ap-payments`;

  constructor(private http: HttpClient) { }

  getPayments(accountPayableId?: number): Observable<ApPayment[]> {
    let params = new HttpParams();
    if (accountPayableId) params = params.set('account_payable_id', accountPayableId);
    return this.http.get<ApPayment[]>(this.apiUrl, { params });
  }

  getPayment(id: number): Observable<ApPayment> {
    return this.http.get<ApPayment>(`${this.apiUrl}/${id}`);
  }

  createPayment(payment: ApPayment): Observable<ApPayment> {
    return this.http.post<ApPayment>(this.apiUrl, payment);
  }

  deletePayment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
