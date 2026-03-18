import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions, Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ApiService } from '../core/services/api.service';
import { DashboardData, PAYMENT_METHOD_LABELS, PaymentMethod } from '../core/models/models';

Chart.register(ChartDataLabels);

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  data?: DashboardData;
  loading = true;
  year = new Date().getFullYear();

  // ── Charts ──────────────────────────────────────────────────
  salesChartData: ChartData<'bar'> = { labels: MONTH_NAMES, datasets: [] };
  paymentChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  storeSalesChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  storePurchasesChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  storeRows: any[] = [];

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: '#475569',
        font: { weight: 'bold', size: 10 },
        formatter: (value: any) => {
          if (Number(value) === 0) return null;
          if (Number(value) >= 1000000) {
            return `$${(Number(value) / 1000000).toFixed(1)}M`;
          }
          return `$${Math.round(value).toLocaleString('es-CO')}`;
        }
      } as any,
      tooltip: {
        callbacks: {
          label: ctx => `$ ${Math.round(ctx.raw as number).toLocaleString('es-CO')}`,
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: v => `$${(+v / 1_000_000).toFixed(1)}M`,
        },
        grid: { color: '#f1f5f9' }
      }
    }
  };

  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold', size: 11 },
        formatter: (value: any, ctx: any) => {
          if (Number(value) === 0) return null;
          if (Number(value) >= 1000000) {
            return `$${(Number(value) / 1000000).toFixed(1)}M`;
          }
          return `$${Math.round(value).toLocaleString('es-CO')}`;
        }
      } as any,
      tooltip: {
        callbacks: {
          label: ctx => `$ ${Math.round(ctx.raw as number).toLocaleString('es-CO')}`,
        }
      }
    }
  };

  constructor(private api: ApiService) {
    window.addEventListener('yearChanged', (e: any) => {
      this.year = e.detail;
      this.load();
    });
  }

  ngOnInit(): void {
    const saved = localStorage.getItem('selectedYear');
    if (saved) this.year = +saved;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.get<DashboardData>('dashboard', { year: this.year }).subscribe({
      next: d => {
        this.data = d;
        this.buildStoreRows(d); // Important to call before buildCharts if charts use storeRows
        this.buildCharts(d);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private buildCharts(d: DashboardData): void {
    // Group by-month data per store
    const storeIds   = [...new Set(d.sales.by_month.map(m => m.store_id))];
    const storeNames = d.sales.by_store.map(s => s.store);
    const palette    = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#f43f5e'];

    const datasets = storeIds.map((sid, idx) => {
      const store   = storeNames.find(s => s.id === sid);
      const monthly = Array(12).fill(0);
      d.sales.by_month
        .filter(m => m.store_id === sid)
        .forEach(m => monthly[m.month - 1] = m.total);
      return {
        label: store?.name ?? `Tienda ${sid}`,
        data: monthly,
        backgroundColor: palette[idx % palette.length] + 'cc',
        borderColor: palette[idx % palette.length],
        borderWidth: 1.5,
        borderRadius: 5,
      };
    });

    this.salesChartData = { labels: MONTH_NAMES, datasets };

    // Store Sales Doughnut
    const salesPalette = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#eab308', '#ec4899'];
    this.storeSalesChartData = {
      labels: this.storeRows.map(s => s.name),
      datasets: [{
        data: this.storeRows.map(s => s.salesTotal),
        backgroundColor: salesPalette.slice(0, this.storeRows.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    // Store Purchases Doughnut
    const purchasesPalette = ['#8b5cf6', '#0ea5e9', '#ef4444', '#f97316', '#14b8a6', '#8b5cf6'];
    this.storePurchasesChartData = {
      labels: this.storeRows.map(s => s.name),
      datasets: [{
        data: this.storeRows.map(s => s.purchasesTotal),
        backgroundColor: purchasesPalette.slice(0, this.storeRows.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    // Payment methods doughnut
    const pmColors: Record<string, string> = {
      EF: '#10b981', CF: '#f59e0b', TR: '#06b6d4',
      TD: '#6366f1', TC: '#f43f5e', VA: '#8b5cf6'
    };
    this.paymentChartData = {
      labels: d.sales.payment_methods.map(p =>
        PAYMENT_METHOD_LABELS[p.method as PaymentMethod] ?? p.method
      ),
      datasets: [{
        data: d.sales.payment_methods.map(p => p.total),
        backgroundColor: d.sales.payment_methods.map(p => pmColors[p.method] ?? '#94a3b8'),
        borderWidth: 2,
        borderColor: '#fff',
      }]
    };
  }

  private buildStoreRows(d: DashboardData): void {
    const totalSales = d.sales.total_with_tax || 1;
    this.storeRows = d.sales.by_store.map(s => {
      const pc = d.purchases.by_store.find(p => p.store_id === s.store_id);
      return {
        name:           s.store?.name ?? 'Tienda',
        code:           s.store?.code ?? '',
        salesTotal:     s.total,
        salesTax:       s.tax,
        purchasesTotal: pc?.total ?? 0,
        purchasesTax:   pc?.tax ?? 0,
        pct:           (s.total / totalSales) * 100,
      };
    });
  }
}
