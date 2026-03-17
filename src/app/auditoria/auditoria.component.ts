import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
import { AuditResult } from '../core/models/models';

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.component.html',
})
export class AuditoriaComponent implements OnInit {
  form!: FormGroup;
  results: AuditResult[] = [];
  loading  = false;
  searched = false;

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
    if (this.form.invalid) return;
    this.loading  = true;
    this.searched = false;
    this.api.get<AuditResult[]>('audit/missing-days', this.form.value).subscribe({
      next: res => { this.results = res; this.loading = false; this.searched = true; },
      error: () => { this.loading = false; },
    });
  }

  get hasMissing(): boolean {
    return this.results.some(r => r.missing > 0);
  }
}
