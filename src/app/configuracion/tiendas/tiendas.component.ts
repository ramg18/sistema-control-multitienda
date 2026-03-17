import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Store } from '../../core/models/models';

@Component({
  selector: 'app-tiendas',
  templateUrl: './tiendas.component.html',
})
export class TiendasComponent implements OnInit {
  stores: Store[] = [];
  loading  = false;
  showForm = false;
  editing?: Store;
  form!: FormGroup;
  saving = false;
  error  = '';

  constructor(private api: ApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.load();
  }

  initForm(s?: Store): void {
    this.form = this.fb.group({
      code:                 [s?.code                 ?? '', Validators.required],
      name:                 [s?.name                 ?? '', Validators.required],
      city:                 [s?.city                 ?? '', Validators.required],
      prefix:               [s?.prefix               ?? '', Validators.required],
      cash_register_number: [s?.cash_register_number ?? '', Validators.required],
    });
  }

  load(): void {
    this.loading = true;
    this.api.get<Store[]>('stores').subscribe({ next: r => { this.stores = r; this.loading = false; } });
  }

  openForm(s?: Store): void {
    this.editing = s;
    this.initForm(s);
    this.showForm = true;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.error  = '';
    const obs = this.editing
      ? this.api.put<Store>(`stores/${this.editing.id}`, this.form.value)
      : this.api.post<Store>('stores', this.form.value);
    obs.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.load(); },
      error: err => { this.saving = false; this.error = err?.error?.message ?? 'Error'; },
    });
  }

  delete(s: Store): void {
    if (!confirm(`¿Eliminar tienda ${s.name}?`)) return;
    this.api.delete(`stores/${s.id}`).subscribe(() => this.load());
  }
}
