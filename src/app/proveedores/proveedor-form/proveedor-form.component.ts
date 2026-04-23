import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupplierService } from '../../core/services/supplier/supplier.service';
import { Supplier } from '../../core/models/models';

@Component({
  selector: 'app-proveedor-form',
  templateUrl: './proveedor-form.component.html',
  styleUrls: ['./proveedor-form.component.scss']
})
export class ProveedorFormComponent implements OnInit {
  @Input() supplier?: Supplier;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      nit: [''],
      phone: [''],
      email: ['', [Validators.email]],
      address: ['']
    });
  }

  ngOnInit(): void {
    if (this.supplier) {
      this.form.patchValue(this.supplier);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.saving = true;
    const data = this.form.value;

    const request = this.supplier
      ? this.supplierService.updateSupplier(this.supplier.id, data)
      : this.supplierService.createSupplier(data);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.saved.emit();
      },
      error: (err) => {
        this.saving = false;
        alert('Error al guardar: ' + (err.error?.message || 'Error desconocido'));
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
