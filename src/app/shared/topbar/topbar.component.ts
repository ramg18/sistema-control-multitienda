import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  pageTitle = 'Dashboard';
  selectedYear = new Date().getFullYear();
  years = Array.from({ length: 5 }, (_, i) => this.selectedYear - i);

  private titleMap: Record<string, string> = {
    '/dashboard':                 'Dashboard',
    '/ventas':                    'Ventas',
    '/compras':                   'Compras',
    '/reportes':                  'Reportes',
    '/auditoria':                 'Auditoría',
    '/configuracion':             'Configuración',
    '/configuracion/tiendas':     'Gestión de Tiendas',
    '/configuracion/usuarios':    'Gestión de Usuarios',
  };

  constructor(private auth: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.pageTitle = this.titleMap[e.urlAfterRedirects] ?? 'Sistema';
    });
  }

  get storeName(): string | null {
    return this.auth.currentUser?.store?.name ?? null;
  }

  onYearChange(): void {
    // Broadcast year change via a shared service if needed
    localStorage.setItem('selectedYear', String(this.selectedYear));
    window.dispatchEvent(new CustomEvent('yearChanged', { detail: this.selectedYear }));
  }

  logout(): void { this.auth.logout(); }
}
