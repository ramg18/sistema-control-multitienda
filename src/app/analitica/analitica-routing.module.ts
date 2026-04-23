import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnaliticaComponent } from './analitica.component';

const routes: Routes = [{ path: '', component: AnaliticaComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnaliticaRoutingModule { }
