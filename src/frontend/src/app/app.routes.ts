import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { StudentsComponent } from './pages/students/students.component';
import { StudentProfileComponent } from './pages/student-profile/student-profile.component';
import { EvaluationTypesComponent } from './pages/evaluation-types/evaluation-types.component';
import { StudentEvaluationComponent } from './pages/student-evaluation/student-evaluation.component';
import { TrainingComponent } from './pages/training/training.component';
import { TrainingConfigComponent } from './pages/training-config/training-config.component';
import { GamesComponent } from './pages/games/games.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'students', component: StudentsComponent, canActivate: [authGuard] },
  { path: 'student-profile', component: StudentProfileComponent, canActivate: [authGuard] },
  { path: 'student-evaluation', component: StudentEvaluationComponent, canActivate: [authGuard] },
  { path: 'evaluation-types', component: EvaluationTypesComponent, canActivate: [authGuard], data: { papel: 'Administrador' } },
  { path: 'training', component: TrainingComponent, canActivate: [authGuard] },
  { path: 'training-config', component: TrainingConfigComponent, canActivate: [authGuard], data: { papel: 'Administrador' } },
  { path: 'games', component: GamesComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersComponent, canActivate: [authGuard], data: { papel: 'Administrador' } },
  { path: '**', redirectTo: '' },
];
