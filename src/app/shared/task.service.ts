/**
 * Title: task.service.ts
 * Author: Nolan Berryhill
 * Date: 1/24/2024
 */

// imports statements
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item } from './item.interface';

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

  /**
  * @description deleteTask function to delete a task for an employee by employeeId and TaskId
  * @param empId
  * @param TaskId
  * @returns status code 204 (no content)
  */

  deleteTask(empId: number, taskId: string) {
    console.log('/api/employees/' + empId + '/tasks/' + taskId) // log the task id to the console
    return this.http.delete('/api/employees/' + empId + '/tasks/' + taskId) // make a delete request to the API
  }

  /**
  * @description updateTask function to update a task for an employee by employeeId
  * @param empId
  * @param todo list of tasks to do
  * @param done list of tasks done
  * @returns status code 204 (no content)
  */
  updateTask(empId: number, todo: Item[], done: Item[]) {
    return this.http.put('/api/employees/' + empId + '/tasks', {
      todo,
      done
    })
  }
}
