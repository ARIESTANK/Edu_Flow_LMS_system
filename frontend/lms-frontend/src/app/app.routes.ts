import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

const shell = () => import('./layout/shell.component').then(m => m.ShellComponent);
const profile = () => import('./pages/profile/profile.component').then(m => m.ProfileComponent);

export const routes: Routes = [
  // ---------- Public ----------
  { path: '', loadComponent: () => import('./pages/landing-page/landing-page.component').then(m => m.LandingPage), pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup.component').then(m => m.Signup) },

  // ---------- /student/** (STUDENT only) ----------
  {
    path: 'student',
    canActivate: [authGuard],
    data: { roles: ['STUDENT'] },
    loadComponent: shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'profile', loadComponent: profile },
      {
        // Everything below shows an empty state until the student is enrolled in a class
        path: '',
        loadComponent: () => import('./pages/student/student-gate.component').then(m => m.StudentGateComponent),
        children: [
          { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'my-courses', data: { enrolledOnly: true }, loadComponent: () => import('./pages/course-list/course-list.component').then(m => m.CourseListComponent) },
          { path: 'courses', loadComponent: () => import('./pages/course-list/course-list.component').then(m => m.CourseListComponent) },
          { path: 'courses/:id', loadComponent: () => import('./pages/course-detail/course-detail.component').then(m => m.CourseDetailComponent) },
          { path: 'courses/:id/lessons/:lessonId', loadComponent: () => import('./pages/lesson-player/lesson-player.component').then(m => m.LessonPlayerComponent) },
          { path: 'assignments', pathMatch: 'full', redirectTo: 'assignments/2' },
          { path: 'assignments/:id', loadComponent: () => import('./pages/assignment/assignment.component').then(m => m.AssignmentComponent) },
          { path: 'calendar', loadComponent: () => import('./pages/calendar/calendar.component').then(m => m.CalendarComponent) },
          { path: 'grades', loadComponent: () => import('./pages/grades/grades.component').then(m => m.GradesComponent) },
        ],
      },
    ],
  },

  // ---------- /admin/** (ADMIN only) ----------
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'users', loadComponent: () => import('./pages/admin/user-management.component').then(m => m.UserManagementComponent) },
      { path: 'courses', loadComponent: () => import('./pages/admin/course-management.component').then(m => m.CourseManagementComponent) },
      { path: 'classes', loadComponent: () => import('./pages/admin/class-management.component').then(m => m.ClassManagementComponent) },
      { path: 'teaching', loadComponent: () => import('./pages/admin/teaching-management.component').then(m => m.TeachingManagementComponent) },
      { path: 'performance', loadComponent: () => import('./pages/admin/student-performance.component').then(m => m.StudentPerformanceComponent) },
      { path: 'system', loadComponent: () => import('./pages/admin/system-settings.component').then(m => m.SystemSettingsComponent) },
      { path: 'profile', loadComponent: profile },
    ],
  },

  { path: '**', redirectTo: '' },
];
