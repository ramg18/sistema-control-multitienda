import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CuentaListComponent } from './cuenta-list/cuenta-list.component';

const routes: Routes = [
  { path: '', component: CuentaListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CuentasPagarRoutingModule { }
