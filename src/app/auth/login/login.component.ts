import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  year = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    if (this.auth.isLoggedIn) this.router.navigate(['/dashboard']);

    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error   = '';

    this.auth.login(this.loginForm.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error   = err?.error?.message ?? 'Credenciales incorrectas. Verifica tu correo y contraseña.';
        this.loading = false;
      },
    });
  }
}
