import { Component } from '@angular/core';

@Component({
  selector: 'app-configuracion',
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Configuración</h2>
        <p class="page-subtitle">Administración del sistema</p>
      </div>
    </div>
    <div class="kpi-grid">
      <a routerLink="tiendas" class="kpi-card kpi-emerald" style="text-decoration:none; cursor:pointer">
        <div class="kpi-label">Tiendas</div>
        <div class="kpi-value">Gestionar</div>
        <div class="kpi-sub">Crear y editar tiendas</div>
        <div class="kpi-icon">🏪</div>
      </a>
      <a routerLink="usuarios" class="kpi-card kpi-teal" style="text-decoration:none; cursor:pointer">
        <div class="kpi-label">Usuarios</div>
        <div class="kpi-value">Gestionar</div>
        <div class="kpi-sub">Crear y editar usuarios</div>
        <div class="kpi-icon">👥</div>
      </a>
    </div>
  `,
})
export class ConfiguracionComponent {}
