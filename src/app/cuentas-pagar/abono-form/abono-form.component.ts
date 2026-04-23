import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApPaymentService } from '../../core/services/ap-payment/ap-payment.service';
import { AccountPayable } from '../../core/models/models';

@Component({
  selector: 'app-abono-form',
  templateUrl: './abono-form.component.html',
  styleUrls: ['./abono-form.component.scss']
})
export class AbonoFormComponent implements OnInit {
  @Input() accountPayable!: AccountPayable;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private apPaymentService: ApPaymentService
  ) {
    this.form = this.fb.group({
      payment_date: [new Date().toISOString().split('T')[0], Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      payment_method: ['Efectivo'],
      reference_number: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    if (this.accountPayable) {
      this.form.patchValue({ amount: this.accountPayable.balance });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    
    // Check if amount is larger than balance
    const amount = this.form.get('amount')?.value;
    if (amount > this.accountPayable.balance) {
      alert(`El abono no puede superar el saldo actual ($${this.accountPayable.balance})`);
      return;
    }

    this.saving = true;
    const data = {
      ...this.form.value,
      account_payable_id: this.accountPayable.id
    };

    this.apPaymentService.createPayment(data).subscribe({
      next: () => {
        this.saving = false;
        this.saved.emit();
      },
      error: (err) => {
        this.saving = false;
        alert('Error al guardar abono: ' + (err.error?.message || 'Error desconocido'));
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
