/**
 * Title: tasks.component.ts
 * Author: Nolan Berryhill
 * Date: 2/03/2024
 */

// imports statements
import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TaskService } from '../shared/task.service';
import { Employee } from '../shared/employee.interface';
import { Item } from '../shared/item.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

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

  // delete task
  deleteTask(taskId: string) {
    console.log(`Task item: ${taskId}`)

    // confirm dialog
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    // Call the deleteTask() function on the taskService to subscribe to the observable and pass in the empId and taskId
    this.taskService.deleteTask(this.empId, taskId).subscribe({
      // If the task is deleted successfully, remove it from the task array
      next: (res: any) => {
        console.log('Task deleted with id, taskId')

        if (!this.todo) this.todo = [] // if the todo array is null, set it to an empty array
        if (!this.done) this.done = [] // if the done array is null, set it to an empty array

        // We are doing this because we do not know if the task is in the todo or done array
        this.todo = this.todo.filter(t => t._id.toString() !== taskId) // Filter the array and remove the deleted task
        this.done = this.done.filter(t => t._id.toString() !== taskId) // Filter the array and remove the deleted task

        this.successMessage = 'Task deleted successfully!' // Set the success message

        this.hideAlert() // Call the hideAlert() function
      },
      // if there is an error, lof it to the console and set the error message
      error: (err) => {
        console.log('error', err)
        this.errorMessage = err.message

        this.hideAlert() // calls the hideAlert() function
      }
    })
  }

  // drop event for the todo and done lists using the cdkDragDrop directive from the drag and drop module
  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      // if the item is dropped in the same container, move it to the new index
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)

      console.log('Moved item in array', event.container.data) //log the new array to the console

      // call the updateTaskList() function and pass in the empId, todo and done arrays
      this.updateTaskList(this.empId, this.todo, this.done)
    } else {
      // if the item is dropped in a different container, move it to the new container
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      )

      console.log('Moved item in array', event.container.data) // Log the new array to the console

      // Call the updateTaskList() function and pass in the empId, todo and done arrays
      this.updateTaskList(this.empId, this.todo, this.done)
    }
  }

  // Timeout the notification warning
  hideAlert() {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 5000)
  }

  /**
  * @description Updates the task list for employee with the specified empId and passes in the todo and done arrays
  * @param empId
  * @param todo
  * @param done
  * @returns void
  */

  // update a task list for the application
  updateTaskList(empId: number, todo: Item[], done: Item[]) {
    this.taskService.updateTask(empId, todo, done).subscribe({
      next: (res: any) => {
        console.log('Task updated successfully')
      },
      // call out error
      error: (err) => {
        console.log('error', err) // log the error message to the console
        this.errorMessage = err.message
        this.hideAlert() // call the hideAlert() function
      }
    })
  }

}
