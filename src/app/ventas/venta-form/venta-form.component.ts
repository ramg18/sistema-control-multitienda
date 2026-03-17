import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Sale, Store, TaxRate } from '../../core/models/models';

@Component({
  selector: 'app-venta-form',
  templateUrl: './venta-form.component.html',
})
export class VentaFormComponent implements OnInit {
  @Input() stores: Store[] = [];
  @Input() taxRates: TaxRate[] = [];
  @Input() sale?: Sale;
  @Output() saved     = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  saving = false;
  error  = '';

  today = new Date().toISOString().split('T')[0];

  paymentMethodOptions = [
    { v: 'EF', l: 'Efectivo' }, { v: 'CF', l: 'Crédito/Fiado' },
    { v: 'TR', l: 'Transferencia' }, { v: 'TD', l: 'Débito' },
    { v: 'TC', l: 'T. Crédito' }, { v: 'VA', l: 'Vale' },
  ];

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit(): void {
    const s = this.sale;
    this.form = this.fb.group({
      store_id:            [s?.store_id ?? '',   Validators.required],
      sale_date:           [s?.sale_date ?? this.today, Validators.required],
      registration_date:   [s?.registration_date ?? this.today, Validators.required],
      prefix:              [s?.prefix ?? '',     Validators.required],
      doc_number:          [s?.doc_number ?? '', Validators.required],
      client:              [s?.client ?? 'VARIOS', Validators.required],
      total_with_tax:      [s?.total_with_tax ?? '', [Validators.required, Validators.min(0)]],
      tax_rate_id:         [s?.tax_rate_id ?? '', Validators.required],
      operations_count:    [s?.operations_count ?? 1],
      observations:        [s?.observations ?? ''],
      is_day_without_record: [s?.is_day_without_record ?? false],
      payment_methods:     this.fb.array(
        s?.payment_methods?.map(pm => this.fb.group({
          method: [pm.method, Validators.required],
          amount: [pm.amount, [Validators.required, Validators.min(0)]],
        })) ?? []
      ),
    });

    // If no PM, add one blank
    if (!s?.payment_methods?.length) this.addPM();

    // Auto-calculate doc_number based on sale_date
    this.form.get('sale_date')?.valueChanges.subscribe(date => {
      if (date && typeof date === 'string') {
        const day = date.split('-')[2];
        if (day) {
          this.form.patchValue({ doc_number: String(Number(day)).padStart(3, '0') });
        }
      }
    });

    // Set initial doc_number if new sale
    if (!s) {
      const initialDate = this.form.get('sale_date')?.value;
      if (initialDate && typeof initialDate === 'string') {
        const day = initialDate.split('-')[2];
        if (day) {
          this.form.patchValue({ doc_number: String(Number(day)).padStart(3, '0') });
        }
      }
    }
  }

  get pms(): FormArray { return this.form.get('payment_methods') as FormArray; }

  addPM(): void {
    this.pms.push(this.fb.group({
      method: ['EF', Validators.required],
      amount: ['',   [Validators.required, Validators.min(0)]],
    }));
  }

  removePM(i: number): void { this.pms.removeAt(i); }

  get calculatedBase(): number {
    const total = this.form.get('total_with_tax')?.value || 0;
    const rateId = this.form.get('tax_rate_id')?.value;
    if (!rateId) return 0;
    const rate = this.taxRates.find(r => r.id == rateId)?.rate || 0;
    return total / (1 + rate);
  }

  get calculatedTax(): number {
    const total = this.form.get('total_with_tax')?.value || 0;
    return total - this.calculatedBase;
  }

  onSubmit(): void {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      this.error = 'Por favor completa todos los campos obligatorios (*) correctamente.';
      return; 
    }
    this.saving = true;
    this.error  = '';

    const body = this.form.value;
    const obs  = this.sale
      ? this.api.put<Sale>(`sales/${this.sale.id}`, body)
      : this.api.post<Sale>('sales', body);

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
