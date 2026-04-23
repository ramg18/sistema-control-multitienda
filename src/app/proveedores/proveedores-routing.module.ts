import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProveedorListComponent } from './proveedor-list/proveedor-list.component';

const routes: Routes = [
  { path: '', component: ProveedorListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProveedoresRoutingModule { }
