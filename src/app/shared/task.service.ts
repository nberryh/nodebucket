import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
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
