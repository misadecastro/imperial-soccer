import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  senha = '';
  erro = '';
  enviando = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  onSubmit(event: Event): void {
    event.preventDefault();
    this.erro = '';

    if (!this.email || !this.senha) {
      this.erro = 'Informe e-mail e senha.';
      return;
    }

    this.enviando = true;
    this.authService.login({ email: this.email, senha: this.senha }).subscribe({
      next: () => {
        this.enviando = false;
        this.router.navigateByUrl('/students');
      },
      error: (err) => {
        this.enviando = false;
        if (err.status === 423) {
          this.erro = 'Conta temporariamente bloqueada. Tente novamente mais tarde.';
        } else {
          this.erro = 'E-mail ou senha inválidos.';
        }
      },
    });
  }
}
