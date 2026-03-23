import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { AuditResult } from '../core/models/models';

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.scss']
})
export class AuditoriaComponent implements OnInit {
  form!: FormGroup;
  results: AuditResult[] = [];
  loading  = false;
  searched = false;
  debugError = '';

  today    = new Date().toISOString().split('T')[0];
  firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      from: [this.firstDay, Validators.required],
      to:   [this.today,    Validators.required],
    });
  }

  search(): void {
    this.debugError = '';
    
    if (this.form.invalid) {
      this.debugError = 'El formulario tiene errores de validación. Selecciona ambas fechas.';
      return;
    }
    
    this.loading  = true;
    this.searched = false;
    
    // Parse values in case datepicker sends Date objects
    const values = this.form.value;
    const fromStr = values.from instanceof Date ? values.from.toISOString().split('T')[0] : values.from;
    const toStr = values.to instanceof Date ? values.to.toISOString().split('T')[0] : values.to;

    this.api.get<AuditResult[]>('audit/missing-days', { from: fromStr, to: toStr }).subscribe({
      next: res => { this.results = res; this.loading = false; this.searched = true; },
      error: (err) => { 
        this.loading = false; 
        this.debugError = 'Error HTTP del API: ' + (err.message || 'Error del servidor');
        console.error('API Error:', err);
      },
    });
  }

  get hasMissing(): boolean {
    return this.results.some(r => r.missing > 0);
  }
}
