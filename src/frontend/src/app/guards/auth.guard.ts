import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Protege rotas exigindo sessão autenticada (FR-002, US3). Se a rota declarar
 * `data: { papel: 'Administrador' }`, também exige que o papel do usuário corresponda
 * (usado em /users — FR-004).
 */
export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigateByUrl('/login');
    return false;
  }

  const papelExigido = route.data?.['papel'] as string | undefined;
  if (papelExigido && authService.getUsuarioAtual()?.papel !== papelExigido) {
    router.navigateByUrl('/students');
    return false;
  }

  return true;
};
