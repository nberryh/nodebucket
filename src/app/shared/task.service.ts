/**
 * Title: task.service.ts
 * Author: Nolan Berryhill
 * Date: 1/24/2024
 */

// imports statements
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// injectable of provideIn
@Injectable({
  providedIn: 'root'
})

// Export TaskService
export class TaskService {

  constructor(private http: HttpClient) { }

  // getTasks
  getTasks(empId: number) {
    return this.http.get('/api/employees/' + empId + '/tasks');
  }

  // createTask
  addTask(empId: number, text: string) {
    return this.http.post('/api/employees/' + empId + '/tasks', { text });
  }
}
