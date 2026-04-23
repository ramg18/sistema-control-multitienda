import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Store, Supplier, AccountPayable } from '../../core/models/models';

@Component({
  selector: 'app-cuenta-form',
  templateUrl: './cuenta-form.component.html',
  styleUrls: ['./cuenta-form.component.scss']
})
export class CuentaFormComponent implements OnInit {
  @Input() stores: Store[] = [];
  @Input() suppliers: Supplier[] = [];
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  saving = false;
  error = '';
  today = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit(): void {
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 30);
    
    this.form = this.fb.group({
      store_id:       ['', Validators.required],
      supplier_id:    ['', Validators.required],
      invoice_number: ['', Validators.required],
      amount:         ['', [Validators.required, Validators.min(0.01)]],
      issue_date:     [this.today, Validators.required],
      due_date:       [defaultDue.toISOString().split('T')[0], Validators.required],
      notes:          [''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    this.api.post<AccountPayable>('account-payables', this.form.value).subscribe({
      next: () => {
        this.saving = false;
        this.saved.emit();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || 'Error al guardar la deuda manual.';
      }
    });
  }
}
