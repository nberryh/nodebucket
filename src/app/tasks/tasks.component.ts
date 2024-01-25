/**
 * Title: tasks.component.ts
 * Author: Nolan Berryhill
 * Date: 1/24/2024
 */

// imports statements
import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TaskService } from '../shared/task.service';
import { Employee } from '../shared/employee.interface';
import { Item } from '../shared/item.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Component with selector, templateUrl, and styleUrls
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})

// Export TasksComponent
export class TasksComponent {

  // Give values to const
  employee: Employee;
  empId: number;
  todo: Item[];
  done: Item[];
  errorMessage: string;
  successMessage: string;

  // newTaskForm format for text
  newTaskForm: FormGroup = this.fb.group({
    text: [null, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(50)])]
  });

  // Constructor with privates
  constructor(private cookieService: CookieService, private taskService: TaskService, private fb: FormBuilder) {
    this.employee = {} as Employee;
    this.todo = [];
    this.done = [];
    this.errorMessage = '';
    this.successMessage = '';

    this.empId = parseInt(this.cookieService.get('session_user'), 10);

    // Equation for taskService with getTasks
    this.taskService.getTasks(this.empId).subscribe({
      next: (res: any) => {
        console.log('Employee', res);
        this.employee = res;
      },
      error: (err) => {
        console.error('error', err);
        this.errorMessage = err.message;
        this.hideAlert(); // Hide alert after 5 seconds
      },
      complete: () => {
        this.employee.todo ? this.todo = this.employee.todo : this.todo = [];
        this.employee.done ? this.done = this.employee.done : this.done = [];

        console.log('todo', this.todo);
        console.log('done', this.done);
      }
    })
  }

  // addTask to add task to task page
  addTask() {
    const text = this.newTaskForm.controls['text'].value;

    this.taskService.addTask(this.empId, text).subscribe({
      next: (task: any) => {
        console.log('Task added with id', task.id);
        const newTask = {
          _id: task.id,
          text: text
        }

        this.todo.push(newTask);
        this.newTaskForm.reset();

        this.successMessage = 'Task added successfully';

        this.hideAlert(); // Hide alert after 5 seconds
      },
      error: (err) => {
        console.log('error', err);
        this.errorMessage = err.message;
        this.hideAlert(); // Hide alert after 5 seconds
      }
    });
  }

  // Timeout the notification warning
  hideAlert() {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 5000)
  }

}
