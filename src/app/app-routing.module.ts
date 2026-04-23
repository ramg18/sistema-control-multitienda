import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './shared/layout/layout.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VentasComponent } from './ventas/ventas.component';
import { ComprasComponent } from './compras/compras.component';
import { GastosComponent } from './gastos/gastos.component';
import { ReportesComponent } from './reportes/reportes.component';
import { AuditoriaComponent } from './auditoria/auditoria.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { TiendasComponent } from './configuracion/tiendas/tiendas.component';
import { UsuariosComponent } from './configuracion/usuarios/usuarios.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'ventas',    component: VentasComponent },
      { path: 'compras',   component: ComprasComponent },
      { path: 'gastos',    component: GastosComponent },
      { path: 'reportes',  component: ReportesComponent },
      { path: 'auditoria', component: AuditoriaComponent },
      { path: 'proveedores', loadChildren: () => import('./proveedores/proveedores.module').then(m => m.ProveedoresModule) },
      { path: 'cuentas-pagar', loadChildren: () => import('./cuentas-pagar/cuentas-pagar.module').then(m => m.CuentasPagarModule) },
      { path: 'analitica', loadChildren: () => import('./analitica/analitica.module').then(m => m.AnaliticaModule) },
      {
        path: 'configuracion',
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        children: [
          { path: '', component: ConfiguracionComponent },
          { path: 'tiendas',  component: TiendasComponent },
          { path: 'usuarios', component: UsuariosComponent },
        ]
      },
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
