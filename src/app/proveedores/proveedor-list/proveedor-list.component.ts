import { Component, OnInit } from '@angular/core';
import { SupplierService } from '../../core/services/supplier/supplier.service';
import { Supplier } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-proveedor-list',
  templateUrl: './proveedor-list.component.html',
  styleUrls: ['./proveedor-list.component.scss']
})
export class ProveedorListComponent implements OnInit {
  suppliers: Supplier[] = [];
  loading = false;
  showForm = false;
  editingSupplier?: Supplier;

  constructor(
    private supplierService: SupplierService,
    public auth: AuthService
  ) {}

  get canEdit(): boolean {
    return !this.auth.isCashier; // Cashiers cannot edit suppliers
  }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.supplierService.getSuppliers().subscribe({
      next: (res) => {
        // En caso de que Laravel devuelva la colección envuelta en { data: [...] }
        this.suppliers = (res as any).data ? (res as any).data : res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openForm(supplier?: Supplier): void {
    this.editingSupplier = supplier;
    this.showForm = true;
  }

  onFormSaved(): void {
    this.showForm = false;
    this.editingSupplier = undefined;
    this.loadSuppliers();
  }

  onFormCancelled(): void {
    this.showForm = false;
    this.editingSupplier = undefined;
  }

  deleteSupplier(id: number | undefined): void {
    if (!id || !confirm('¿Estás seguro de eliminar este proveedor?')) return;
    
    this.supplierService.deleteSupplier(id).subscribe({
      next: () => this.loadSuppliers(),
      error: (err) => alert('Error al eliminar: ' + (err.error?.message || 'Verifica que no tenga compras o cuentas asociadas.'))
    });
  }
}
