import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { Papel, Usuario } from '../../models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EmptyStateComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  readonly papeis: Papel[] = ['Administrador', 'Professor'];

  usuarios: Usuario[] = [];
  carregando = true;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  mostrarCadastro = false;
  novoNome = '';
  novoEmail = '';
  novaSenha = '';
  novoPapel: Papel = 'Professor';
  erroCadastro = '';

  editandoId: string | null = null;
  editNome = '';
  editPapel: Papel = 'Professor';
  editAtivo = true;
  editNovaSenha = '';
  erroEdicao = '';

  constructor(private readonly usersService: UsersService) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  private carregarUsuarios(): void {
    this.carregando = true;
    this.usersService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.mostrarToast('Não foi possível carregar os usuários.', 'error');
      },
    });
  }

  toggleCadastro(): void {
    this.mostrarCadastro = !this.mostrarCadastro;
    this.erroCadastro = '';
  }

  cancelarCadastro(): void {
    this.mostrarCadastro = false;
    this.novoNome = '';
    this.novoEmail = '';
    this.novaSenha = '';
    this.novoPapel = 'Professor';
    this.erroCadastro = '';
  }

  submitCadastro(): void {
    this.erroCadastro = '';
    if (!this.novoNome || !this.novoEmail || !this.novaSenha) {
      this.erroCadastro = 'Preencha nome, e-mail e senha.';
      return;
    }

    this.usersService
      .criar({ nome: this.novoNome, email: this.novoEmail, senha: this.novaSenha, papel: this.novoPapel })
      .subscribe({
        next: () => {
          this.cancelarCadastro();
          this.mostrarToast('Usuário cadastrado com sucesso!');
          this.carregarUsuarios();
        },
        error: (err) => {
          this.erroCadastro = err?.error?.message ?? 'Não foi possível cadastrar o usuário.';
        },
      });
  }

  iniciarEdicao(usuario: Usuario): void {
    this.editandoId = usuario.id;
    this.editNome = usuario.nome;
    this.editPapel = usuario.papel;
    this.editAtivo = usuario.ativo;
    this.editNovaSenha = '';
    this.erroEdicao = '';
  }

  cancelarEdicao(): void {
    this.editandoId = null;
    this.erroEdicao = '';
  }

  salvarEdicao(id: string): void {
    this.erroEdicao = '';
    this.usersService
      .atualizar(id, {
        nome: this.editNome,
        papel: this.editPapel,
        ativo: this.editAtivo,
        novaSenha: this.editNovaSenha || undefined,
      })
      .subscribe({
        next: () => {
          this.editandoId = null;
          this.mostrarToast('Usuário atualizado com sucesso!');
          this.carregarUsuarios();
        },
        error: (err) => {
          this.erroEdicao = err?.error?.message ?? 'Não foi possível atualizar o usuário.';
        },
      });
  }

  private mostrarToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toast = { message, type };
    setTimeout(() => {
      this.toast = null;
    }, 3000);
  }
}
