import { Pipe, PipeTransform } from '@angular/core';
import { PAYMENT_METHOD_LABELS, PaymentMethod } from '../../core/models/models';

@Pipe({ name: 'paymentMethod' })
export class PaymentMethodPipe implements PipeTransform {
  transform(value: PaymentMethod | string): string {
    return PAYMENT_METHOD_LABELS[value as PaymentMethod] ?? value;
  }
}
