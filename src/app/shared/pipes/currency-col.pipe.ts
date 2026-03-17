import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyCol' })
export class CurrencyColPipe implements PipeTransform {
  transform(value: number | null | undefined, symbol = '$'): string {
    if (value === null || value === undefined) return `${symbol} 0`;
    return `${symbol} ${Math.round(value).toLocaleString('es-CO')}`;
  }
}
