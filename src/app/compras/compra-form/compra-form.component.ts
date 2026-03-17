import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Purchase, Store, Supplier, RetentionType } from '../../core/models/models';

@Component({
  selector: 'app-compra-form',
  templateUrl: './compra-form.component.html',
})
export class CompraFormComponent implements OnInit {
  @Input() stores: Store[] = [];
  @Input() suppliers: Supplier[] = [];
  @Input() purchase?: Purchase;
  @Output() saved     = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  retentionTypes: RetentionType[] = [];
  saving = false;
  error  = '';
  today  = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<RetentionType[]>('retention-types').subscribe(r => this.retentionTypes = r);
    const p = this.purchase;
    this.form = this.fb.group({
      store_id:       [p?.store_id      ?? '', Validators.required],
      supplier_id:    [p?.supplier_id   ?? '', Validators.required],
      purchase_date:  [p?.purchase_date ?? this.today, Validators.required],
      prefix:         [p?.prefix        ?? '', Validators.required],
      invoice_number: [p?.invoice_number ?? '', Validators.required],
      subtotal:       [p?.subtotal       ?? '', [Validators.required, Validators.min(0)]],
      tax_amount:     [p?.tax_amount     ?? 0],
      observations:   [p?.observations   ?? ''],
      retentions: this.fb.array(
        p?.retentions?.map(r => this.fb.group({
          retention_type_id: [r.retention_type_id, Validators.required],
          base: [r.base, [Validators.required, Validators.min(0)]],
          rate: [r.rate, [Validators.required, Validators.min(0)]],
        })) ?? []
      ),
    });
  }

  get rets(): FormArray { return this.form.get('retentions') as FormArray; }

  addRet(): void {
    this.rets.push(this.fb.group({
      retention_type_id: ['', Validators.required],
      base: ['', [Validators.required, Validators.min(0)]],
      rate: ['', [Validators.required, Validators.min(0)]],
    }));
  }

  removeRet(i: number): void { this.rets.removeAt(i); }

  onRetTypeChange(i: number): void {
    const rtId = this.rets.at(i).get('retention_type_id')?.value;
    const rt   = this.retentionTypes.find(r => r.id == rtId);
    if (rt) {
      this.rets.at(i).patchValue({ rate: rt.rate });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.error  = '';
    const body = this.form.value;
    const obs  = this.purchase
      ? this.api.put<Purchase>(`purchases/${this.purchase.id}`, body)
      : this.api.post<Purchase>('purchases', body);

    obs.subscribe({
      next: () => { this.saving = false; this.saved.emit(); },
      error: err => {
        this.saving = false;
        const msgs = err?.error?.errors
          ? Object.values(err.error.errors).flat().join(', ')
          : err?.error?.message ?? 'Error al guardar';
        this.error = msgs as string;
      },
    });
  }
}
