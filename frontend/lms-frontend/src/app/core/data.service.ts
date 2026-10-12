import { Injectable } from '@angular/core';

export interface Course {
  id: number; title: string; code: string; lessons: number; level: string;
  category: string; rating: number; reviews: number; progress: number | null;
  gradient: string; instructor: string;
}

/** Mock data. Swap each property for an HttpClient call to your Spring Boot API. */
@Injectable({ providedIn: 'root' })
export class DataService {
  courses: Course[] = [
    { id: 1, title: 'Web Development', code: 'CS101', lessons: 12, level: 'Beginner', category: 'Programming', rating: 4.8, reviews: 120, progress: 75, gradient: 'from-blue-600 to-indigo-900', instructor: 'Dr. Kyaw Zaw' },
    { id: 2, title: 'Database Systems', code: 'CS102', lessons: 10, level: 'Intermediate', category: 'Database', rating: 4.7, reviews: 98, progress: 40, gradient: 'from-sky-500 to-blue-900', instructor: 'Daw Hnin Su' },
    { id: 3, title: 'Data Structures & Algorithms', code: 'CS103', lessons: 14, level: 'Intermediate', category: 'Programming', rating: 4.8, reviews: 112, progress: 30, gradient: 'from-violet-600 to-slate-900', instructor: 'U Min Thu' },
    { id: 4, title: 'English for IT', code: 'EN101', lessons: 8, level: 'Beginner', category: 'Others', rating: 4.5, reviews: 64, progress: 50, gradient: 'from-teal-500 to-cyan-900', instructor: 'Daw Mya Thandar' },
    { id: 5, title: 'Mobile App Development', code: 'CS104', lessons: 14, level: 'Intermediate', category: 'Programming', rating: 4.6, reviews: 88, progress: null, gradient: 'from-fuchsia-600 to-indigo-900', instructor: 'U Aung Ko' },
    { id: 6, title: 'Cloud Computing', code: 'CS106', lessons: 10, level: 'Advanced', category: 'Others', rating: 4.7, reviews: 76, progress: null, gradient: 'from-cyan-500 to-blue-900', instructor: 'Dr. Thida Aye' },
    { id: 7, title: 'Machine Learning', code: 'CS108', lessons: 16, level: 'Advanced', category: 'Programming', rating: 4.9, reviews: 143, progress: null, gradient: 'from-purple-600 to-slate-900', instructor: 'Dr. Hsu Myat' },
    { id: 8, title: 'UI/UX Design', code: 'DS101', lessons: 9, level: 'Beginner', category: 'Design', rating: 4.6, reviews: 59, progress: null, gradient: 'from-pink-500 to-rose-900', instructor: 'Daw Ei Phyu' },
  ];

  categories = ['All', 'Programming', 'Database', 'Design', 'Business', 'Others'];

  deadlines = [
    { title: 'Database Systems - Assignment 2', due: 'Due in 2 days', urgent: true },
    { title: 'Web Development - Quiz 1', due: 'Due in 4 days', urgent: false },
  ];

  activity = [
    { text: 'You completed the quiz: HTML Basics', time: '2 hours ago', color: 'bg-emerald-500' },
    { text: 'New assignment was posted (EN101)', time: '5 hours ago', color: 'bg-primary' },
    { text: 'New announcement in Database Systems', time: '1 day ago', color: 'bg-violet-500' },
  ];

  syllabus = [
    { title: 'Module 1: HTML & CSS', lessons: 3, done: true },
    { title: 'Module 2: JavaScript', lessons: 3, done: true },
    { title: 'Module 3: Angular', lessons: 3, done: false },
    { title: 'Module 4: Project', lessons: 3, done: false },
  ];

  outline = [
    { id: 1, title: 'Introduction', done: true },
    { id: 2, title: 'JavaScript Basics', done: false },
    { id: 3, title: 'Variables & Data Types', done: false },
    { id: 4, title: 'Operators', done: false },
    { id: 5, title: 'Functions', done: false },
    { id: 6, title: 'DOM Manipulation', done: false },
  ];

  grades = [
    { course: 'Web Development', score: 92, status: 'On-Going' },
    { course: 'Database Systems', score: 88, status: 'On-Going' },
    { course: 'Data Structures & Algorithms', score: 84, status: 'On-Going' },
    { course: 'English for IT', score: 78, status: 'On-Going' },
  ];

  events = [
    { date: '2026-10-12', title: 'Quiz 1', sub: 'Web Development', time: '10:00 AM', type: 'quiz' },
    { date: '2026-10-14', title: 'Assignment 2', sub: 'Database Systems', time: '11:59 PM', type: 'assignment' },
    { date: '2026-10-16', title: 'Live Class', sub: 'Database Systems', time: '2:00 PM', type: 'live' },
  ];

  getCourse(id: number) { return this.courses.find(c => c.id === id) ?? this.courses[0]; }
}
