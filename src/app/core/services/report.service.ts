import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ProfitAndLossReport, 
  CashFlowReport, 
  TaxesReport, 
  ArApReport, 
  SellerPerformanceReport 
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getProfitAndLoss(startDate?: string, endDate?: string, storeId?: number): Observable<ProfitAndLossReport> {
    let params = new HttpParams();
    if (startDate) params = params.set('start_date', startDate);
    if (endDate) params = params.set('end_date', endDate);
    if (storeId) params = params.set('store_id', storeId.toString());
    return this.http.get<ProfitAndLossReport>(`${this.apiUrl}/profit-and-loss`, { params });
  }

  getCashFlow(startDate?: string, endDate?: string, storeId?: number): Observable<CashFlowReport> {
    let params = new HttpParams();
    if (startDate) params = params.set('start_date', startDate);
    if (endDate) params = params.set('end_date', endDate);
    if (storeId) params = params.set('store_id', storeId.toString());
    return this.http.get<CashFlowReport>(`${this.apiUrl}/cash-flow`, { params });
  }

  getTaxes(startDate?: string, endDate?: string, storeId?: number): Observable<TaxesReport> {
    let params = new HttpParams();
    if (startDate) params = params.set('start_date', startDate);
    if (endDate) params = params.set('end_date', endDate);
    if (storeId) params = params.set('store_id', storeId.toString());
    return this.http.get<TaxesReport>(`${this.apiUrl}/taxes`, { params });
  }

  getArAp(storeId?: number): Observable<ArApReport> {
    let params = new HttpParams();
    if (storeId) params = params.set('store_id', storeId.toString());
    return this.http.get<ArApReport>(`${this.apiUrl}/ar-ap`, { params });
  }

  getSellerPerformance(startDate?: string, endDate?: string, storeId?: number): Observable<SellerPerformanceReport> {
    let params = new HttpParams();
    if (startDate) params = params.set('start_date', startDate);
    if (endDate) params = params.set('end_date', endDate);
    if (storeId) params = params.set('store_id', storeId.toString());
    return this.http.get<SellerPerformanceReport>(`${this.apiUrl}/seller-performance`, { params });
  }
}
