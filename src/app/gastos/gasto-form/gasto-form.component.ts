import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService, Expense } from '../../core/services/expense/expense.service';
import { ExpenseCategory } from '../../core/services/expense-category/expense-category.service';
import { Store } from '../../core/models/models';

@Component({
  selector: 'app-gasto-form',
  templateUrl: './gasto-form.component.html',
  styleUrls: ['./gasto-form.component.scss']
})
export class GastoFormComponent implements OnInit {
  @Input() stores: Store[] = [];
  @Input() categories: ExpenseCategory[] = [];
  @Input() expense?: Expense;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  saving = false;
  error = '';

  constructor(private fb: FormBuilder, private expenseService: ExpenseService) {}

  ngOnInit(): void {
    const defaultDate = new Date().toISOString().split('T')[0];
    const e = this.expense;

    const formatDt = (dt?: string) => {
      if (!dt) return defaultDate;
      return dt.split('T')[0].split(' ')[0];
    };

    this.form = this.fb.group({
      store_id: [e?.store_id ?? '', Validators.required],
      expense_category_id: [e?.expense_category_id ?? '', Validators.required],
      expense_date: [formatDt(e?.expense_date), Validators.required],
      amount: [e?.amount ?? '', [Validators.required, Validators.min(0)]],
      reference_number: [e?.reference_number ?? ''],
      description: [e?.description ?? '']
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    const payload = this.form.value;

    if (this.expense?.id) {
      this.expenseService.updateExpense(this.expense.id, payload).subscribe({
        next: () => {
          this.saving = false;
          this.saved.emit();
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.message || 'Error al actualizar el gasto';
        }
      });
    } else {
      this.expenseService.createExpense(payload).subscribe({
        next: () => {
          this.saving = false;
          this.saved.emit();
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.message || 'Error al guardar el gasto';
        }
      });
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }
}

