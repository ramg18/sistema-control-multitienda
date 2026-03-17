import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Chart.js
import { NgChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TokenInterceptor } from './core/interceptors/token.interceptor';

// Layout
import { LayoutComponent } from './shared/layout/layout.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { TopbarComponent } from './shared/topbar/topbar.component';

// Auth
import { LoginComponent } from './auth/login/login.component';

// Dashboard
import { DashboardComponent } from './dashboard/dashboard.component';

// Ventas
import { VentasComponent } from './ventas/ventas.component';
import { VentaFormComponent } from './ventas/venta-form/venta-form.component';

// Compras
import { ComprasComponent } from './compras/compras.component';
import { CompraFormComponent } from './compras/compra-form/compra-form.component';

// Reportes
import { ReportesComponent } from './reportes/reportes.component';

// Auditoría
import { AuditoriaComponent } from './auditoria/auditoria.component';

// Configuración
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { TiendasComponent } from './configuracion/tiendas/tiendas.component';
import { UsuariosComponent } from './configuracion/usuarios/usuarios.component';

// Shared Pipes
import { CurrencyColPipe } from './shared/pipes/currency-col.pipe';
import { PaymentMethodPipe } from './shared/pipes/payment-method.pipe';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    SidebarComponent,
    TopbarComponent,
    LoginComponent,
    DashboardComponent,
    VentasComponent,
    VentaFormComponent,
    ComprasComponent,
    CompraFormComponent,
    ReportesComponent,
    AuditoriaComponent,
    ConfiguracionComponent,
    TiendasComponent,
    UsuariosComponent,
    CurrencyColPipe,
    PaymentMethodPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    NgChartsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
