import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  constructor(private auth: AuthService) {}

  get isAdmin(): boolean { return this.auth.isAdmin; }
  get userName(): string { return this.auth.currentUser?.name ?? 'Usuario'; }
  get userInitials(): string {
    return this.userName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
  get roleLabel(): string {
    const map: Record<string, string> = {
      admin: 'Administrador',
      store_admin: 'Admin. Tienda',
      cashier: 'Cajero',
    };
    return map[this.auth.currentUser?.role ?? ''] ?? '';
  }

  logout(): void { this.auth.logout(); }
}
