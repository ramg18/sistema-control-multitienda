import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CuentasPagarRoutingModule } from './cuentas-pagar-routing.module';
import { CuentaListComponent } from './cuenta-list/cuenta-list.component';
import { AbonoFormComponent } from './abono-form/abono-form.component';
import { CuentaFormComponent } from './cuenta-form/cuenta-form.component';


import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CuentaListComponent,
    AbonoFormComponent,
    CuentaFormComponent
  ],
  imports: [
    CommonModule,
    CuentasPagarRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class CuentasPagarModule { }
