import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AppUser, Store } from '../../core/models/models';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent implements OnInit {
  users: AppUser[] = [];
  stores: Store[]  = [];
  loading  = false;
  showForm = false;
  editing?: AppUser;
  form!: FormGroup;
  saving = false;
  error  = '';

  roles = [
    { v: 'admin',       l: 'Administrador' },
    { v: 'store_admin', l: 'Admin. Tienda' },
    { v: 'cashier',     l: 'Cajero' },
  ];

  constructor(private api: ApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.api.get<Store[]>('stores').subscribe(s => this.stores = s);
    this.initForm();
    this.load();
  }

  initForm(u?: AppUser): void {
    this.form = this.fb.group({
      name:     [u?.name     ?? '', Validators.required],
      email:    [u?.email    ?? '', [Validators.required, Validators.email]],
      password: [u ? '' : '', u ? [] : [Validators.required, Validators.minLength(8)]],
      role:     [u?.role     ?? 'cashier', Validators.required],
      store_id: [u?.store_id ?? null],
    });
  }

  load(): void {
    this.loading = true;
    this.api.get<{ data: AppUser[] }>('users').subscribe({ next: r => { this.users = r.data; this.loading = false; } });
  }

  openForm(u?: AppUser): void { this.editing = u; this.initForm(u); this.showForm = true; }

  save(): void {
    if (this.form.invalid) { 
        this.form.markAllAsTouched(); 
        alert('Por favor completa todos los campos obligatorios (*) correctamente.\nRevisa los recuadros marcados en rojo.');
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
    const body = { ...this.form.value };
    if (!body.password) delete body.password;
    const obs = this.editing
      ? this.api.put<AppUser>(`users/${this.editing.id}`, body)
      : this.api.post<AppUser>('users', body);
    obs.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.load(); },
      error: err => { 
        this.saving = false; 
        const msgs = err?.error?.errors
          ? Object.values(err.error.errors).flat().join('\n')
          : err?.error?.message ?? 'Error';
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

  delete(u: AppUser): void {
    if (!confirm(`¿Eliminar usuario ${u.name}?`)) return;
    this.api.delete(`users/${u.id}`).subscribe(() => this.load());
  }
}
