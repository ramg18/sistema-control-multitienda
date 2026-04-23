import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnaliticaRoutingModule } from './analitica-routing.module';
import { AnaliticaComponent } from './analitica.component';

@NgModule({
  declarations: [AnaliticaComponent],
  imports: [
    CommonModule,
    AnaliticaRoutingModule,
    FormsModule
  ],
  providers: [
    CurrencyPipe, TitleCasePipe
  ]
})
export class AnaliticaModule { }
