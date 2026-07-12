import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { StudentsComponent } from './pages/students/students.component';
import { StudentEvalComponent } from './pages/student-eval/student-eval.component';
import { TrainingComponent } from './pages/training/training.component';
import { GamesComponent } from './pages/games/games.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'students', component: StudentsComponent, canActivate: [authGuard] },
  { path: 'student-eval', component: StudentEvalComponent, canActivate: [authGuard] },
  { path: 'training', component: TrainingComponent, canActivate: [authGuard] },
  { path: 'games', component: GamesComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersComponent, canActivate: [authGuard], data: { papel: 'Administrador' } },
];
