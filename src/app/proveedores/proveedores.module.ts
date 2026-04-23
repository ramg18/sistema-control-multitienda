import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProveedoresRoutingModule } from './proveedores-routing.module';
import { ProveedorListComponent } from './proveedor-list/proveedor-list.component';
import { ProveedorFormComponent } from './proveedor-form/proveedor-form.component';


import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ProveedorListComponent,
    ProveedorFormComponent
  ],
  imports: [
    CommonModule,
    ProveedoresRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ProveedoresModule { }
