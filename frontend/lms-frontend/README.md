# EduFlow LMS – Angular + Tailwind frontend

## Setup (Angular 17+ standalone)
```bash
ng new eduflow --style=css --routing=false --ssr=false
cd eduflow
npm i -D tailwindcss@3 postcss autoprefixer
```
1. Copy `tailwind.config.js`, `src/styles.css`, `src/index.html` and the whole `src/app/` folder over the generated ones.
2. Make sure `src/main.ts` bootstraps with:
   `bootstrapApplication(AppComponent, appConfig)`
3. Put any sample video at `src/assets/videos/sample.mp4` (add `assets` to angular.json if missing).
4. `ng serve` → http://localhost:4200  (any email + password logs in until you wire the Spring Boot API)

## Pages -> files
| # | Page | Route | File |
|---|------|-------|------|
| 1 | Login | /login | pages/login |
| 2 | Student Dashboard | /dashboard | pages/dashboard |
| 3 | Course List / Browse | /courses, /my-courses | pages/course-list |
| 4 | Course Detail | /courses/:id | pages/course-detail |
| 5 | Lesson / Video Player | /courses/:id/lessons/:lessonId | pages/lesson-player |
| 6 | Assignment Submission | /assignments/:id | pages/assignment |
| 7 | Calendar | /calendar | pages/calendar |
| 8 | Grades / Progress | /grades | pages/grades |
| 9 | Profile / Settings | /profile | pages/profile |

Backend hooks: `core/auth.service.ts` (JWT login), `core/auth.interceptor.ts` (Bearer header),
`core/auth.guard.ts` (role guard via `data: { roles: [...] }`), `core/data.service.ts` (mock data -> replace with HttpClient).
