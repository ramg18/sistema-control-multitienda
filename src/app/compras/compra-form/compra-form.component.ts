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
    const formatDt = (dt?: string) => {
      if (!dt) return this.today;
      return dt.split('T')[0].split(' ')[0];
    };

    const initialTotal = p ? (Number(p.subtotal || 0) + Number(p.tax_amount || 0)) : '';
    const initialIva = p && Number(p.subtotal) > 0 ? Math.round((Number(p.tax_amount) / Number(p.subtotal)) * 100) : 19;

    this.form = this.fb.group({
      store_id:       [p?.store_id      ?? '', Validators.required],
      supplier_id:    [p?.supplier_id   ?? '', Validators.required],
      purchase_date:  [formatDt(p?.purchase_date), Validators.required],
      prefix:         [p?.prefix        ?? '', Validators.required],
      invoice_number: [p?.invoice_number ?? '', Validators.required],
      total_invoice:  [initialTotal, [Validators.required, Validators.min(0)]],
      iva_percentage: [initialIva],
      subtotal:       [p?.subtotal       ?? '', [Validators.required, Validators.min(0)]],
      tax_amount:     [p?.tax_amount     ?? 0],
      observations:   [p?.observations   ?? ''],
      is_credit:      [false],
      due_date:       [''],
      retentions: this.fb.array(
        p?.retentions?.map(r => this.fb.group({
          retention_type_id: [r.retention_type_id, Validators.required],
          base: [r.base, [Validators.required, Validators.min(0)]],
          rate: [r.rate, [Validators.required, Validators.min(0)]],
        })) ?? []
      ),
    });

    // Validar conditionally due_date
    this.form.get('is_credit')?.valueChanges.subscribe(isCredit => {
      const dueCtrl = this.form.get('due_date');
      if (isCredit) {
        dueCtrl?.setValidators(Validators.required);
        if (!dueCtrl?.value) {
          const defaultDue = new Date();
          defaultDue.setDate(defaultDue.getDate() + 30);
          dueCtrl?.setValue(defaultDue.toISOString().split('T')[0]);
        }
      } else {
        dueCtrl?.clearValidators();
        dueCtrl?.setValue('');
      }
      dueCtrl?.updateValueAndValidity();
    });

    this.form.get('total_invoice')?.valueChanges.subscribe(() => this.calculateTotal());
    this.form.get('iva_percentage')?.valueChanges.subscribe(() => this.calculateTotal());
  }

  calculateTotal(): void {
    const total = parseFloat(this.form.get('total_invoice')?.value) || 0;
    const ivaP  = parseFloat(this.form.get('iva_percentage')?.value) || 0;
    
    const subtotal = total / (1 + (ivaP / 100));
    const tax      = total - subtotal;
    
    this.form.patchValue({
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax_amount: parseFloat(tax.toFixed(2))
    }, { emitEvent: false });
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
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      this.error = 'Por favor completa todos los campos obligatorios (*) correctamente.';
      console.log('Form is invalid', this.form.value);
      Object.keys(this.form.controls).forEach(key => {
        const ctrl = this.form.get(key);
        if (ctrl && ctrl.invalid) console.log(key, ctrl.errors);
      });
      alert(this.error + '\nRevisa los recuadros marcados en rojo.');
      setTimeout(() => {
        const errorEl = document.querySelector('.alert-danger') || document.querySelector('form .ng-invalid');
        if (errorEl) {
          errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return; 
    }
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
          ? Object.values(err.error.errors).flat().join('\n')
          : err?.error?.message ?? 'Error al guardar (Backend)';
        this.error = msgs as string;
        
        alert('ERROR DEL SISTEMA:\n\n' + this.error);
        setTimeout(() => {
          const errorEl = document.querySelector('.alert-danger');
          if (errorEl) {
            errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 50);
      },
    });
  }
}
