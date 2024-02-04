/**
====================================================
; Title:  employee.js
; Author: Nolan Berryhill
; Date:   1/29/2024
; Description: Code to use mongo database and swagger successfully
;===================================================
*/

// Make strict
"use strict";

// Gives const a value
const express = require("express");
const router = express.Router();
const { mongo } = require("../utils/mongo");
const Ajv = require('ajv');
const { ObjectId } = require('mongodb');

const ajv = new Ajv();

//ajv schema validation
const taskSchema = {
  type: 'object',
  properties: {
    text: { type: 'string'}
  },
  required: ['text'],
  additionalProperties: false
}

// tasks schema for validation
const tasksSchema = {
  type: 'object',
  required: ['todo', 'done'],
  additionalProperties: false,
  properties: {
    todo: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          text: { type: 'string' }
        },
        required: ['_id', 'text'],
        additionalProperties: false
      }
    },
    done: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          text: { type: 'string'}
        },
        required: ['_id', 'text'],
        additionalProperties: false
      }
    }
  }
}

// Swagger input for findEmployeeById
/**
 * findEmployeeById
 * @swagger
 * /api/employees/{empId}:
 *   get:
 *     summary: Find employee by ID
 *     description: Finds employee details by providing their ID
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with the employee ID.
 *       '400':
 *         description: Bad request, invalid employee ID.
 *       '404':
 *         description: Employee not found.
 *       '500':
 *         description: Internal server error.
 */

// How to get empId
router.get("/:empId", (req, res, next) => {
  try{
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    if (isNaN(empId)) {
      const err = new Error("Employee ID must be a number.");
      err.status = 400;
      console.log("err", err);
      next(err);
      return;
    }

    mongo(async db => {
      const employee = await db.collection("employees").findOne({empId});

      if (!employee) {
        const err = new Error("Unable to find employee with empId" + empId);
        err.status = 404;
        console.log("err", err);
        next(err);
        return;
      }
      res.send(employee);
    });

  } catch (err) {
    console.error("Error: ", err);
    next(err);
  }
});

// Swagger input for get feature of task
/**
 * @swagger
 * /api/employees/{empId}/tasks:
 *   get:
 *     summary: Finds all tasks with employee ID
 *     description: Retrieves tasks with employee ID
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *       - in: query  // Correcting the parameter type to "query"
 *         name: tasks
 *         required: true
 *         description: tasks
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the employee data.
 *       '400':
 *         description: Bad request.
 *       '404':
 *         description: Task not found.
 *       '500':
 *         description: Internal server error.
 */

// How to get empId and their tasks
router.get('/:empId/tasks', (req, res, next) => {
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    if (isNaN(empId)) {
      const err = new Error("input must be a number");
      err.status = 400;
      console.error("err", err);
      next(err);
      return;
    }

    mongo(async db => {
      const tasks = await db.collection('employees').findOne(
        { empId },
        { projection: { empId: 1, todo: 1, done: 1}}
      )

      console.log('tasks', tasks);

      if (!tasks) {
        const err = new Error('Unable to find tasks for empId ' + empId);
        err.status = 404;
        console.error("err", err);
        next(err);
        return;
      }

      res.send(tasks);
    }, next)
  } catch (err) {
    console.error('err', err);
    next(err);
  }
});

// swagger input for Post features for task
/**
 * @swagger
 * /api/employees/{empId}/tasks:
 *   post:
 *     summary: Creates a task for employee
 *     description: Create a task for employee ID.
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Task created.
 *       '400':
 *         description: Bad request.
 *       '404':
 *         description: Task not found.
 *       '500':
 *         description: Internal server error.
 */


//Create task API
router.post('/:empId/tasks', (req, res, next) =>{
  try {
    console.log(req.params);
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    //empId validation
    if (isNaN(empId)) {
      const err = new Error('input must be a number');
      err.status = 400;
      console.error("err", err);
      next(err);
      return;
    }

    // req.body validation
    const { text } = req.body;
    const validator = ajv.compile(taskSchema)
    const isValid = validator({ text })

    if (!isValid) {
      const err = new Error('Bad Request');
      err.status = 400;
      err.errors = validator.errors;
      console.error("err", err);
      next(err);
      return;
    }

    // Creates mongo access to create task
    mongo(async db => {
      const employee = await db.collection('employees').findOne({ empId });

      if (!employee) {
        const err = new Error('Unable to find employee with empId ' + empId);
        err.status = 404;
        console.error("err", err);
        next(err);
        return;
      }

      const task = {
        _id: new ObjectId(),
        text
      }

      const result = await db.collection('employees').updateOne(
        { empId },
        { $push: { todo: task}}
      )

      if (!result.modifiedCount) {
        const err = new Error('Unable to create task for empId ' + empId);
        err.status = 500;
        console.error("err", err);
        next(err);
        return;
      }

      res.status(201).send({ id: task._id })
    }, next)

  } catch (err) {
    console.error('err', err)
    next(err);
  }
});

/**
 * updateTask
 * @swagger
 * /api/employees/{empId}/tasks:
 *   put:
 *     summary: Update tasks for an employee
 *     description: Update task
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - todo
 *               - done
 *             properties:
 *               todo:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     text:
 *                       type: string
 *               done:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     text:
 *                       type: string
 *     responses:
 *       '204':
 *         description: Tasks updated successfully
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Employee not found
 *       '500':
 *         description: Internal Server Error
 */

// Update tasks API
router.put('/:empId/tasks', (req, res, next) => {
  try {
    let { empId } = req.params; // Makes a empID needed
    empId = parseInt(empId, 10);
    console.log('empId', empId); // Log empId to the console

    //empId validation
    if (isNaN(empId)) {
      const err = new Error('input must be a number');
      err.status = 400;
      console.error('err', err);
      next(err);
      return;
    }

    const validator = ajv.compile(tasksSchema);
    // validate the request body
    const isValid = validator(req.body);

    //req.body validation
    if (!isValid) {
      const err = new Error('Bad Request');
      err.status = 400;
      err.errors = validator.errors;
      console.error('err', err);
      next(err);
      return; // return to exit the function
    }

    // Instructions for code to change mongo database
    mongo(async db => {
      const employee = await db.collection('employees').findOne({ empId });

      // if the employee is not found
      if (!employee) {
        const err = new Error('Unable to find employee with empId ' + empId);
        err.status = 404;
        console.error('err', err);
        next(err);
        return;
      }

      const result = await db.collection('employees').updateOne(
        { empId },
        { $set: { todo: req.body.todo, done: req.body.done }}
      )

      // if record was not updated return a 500 status code
      if (!result.modifiedCount) {
        const err = new Error('Unable to update tasks for empId ' + empId);
        err.status = 500;
        console.error('err', err);
        next(err);
        return;
      }

      // Send a success response with a 204 status code.
      res.status(204).send();
    }, next);
  } catch (err) {
    console.log('err', err);
    next(err);
  }
});

/**
  * deleteTask
  * @swagger
  * /api/employees/{empId}/tasks/{taskId}:
  *   delete:
  *     summary: Delete a task for an employee
  *     description: Delete Task
  *     parameters:
  *       - in: path
  *         name: empId
  *         required: true
  *         schema:
  *           type: integer
  *         description: Employee ID
  *       - in: path
  *         name: taskId
  *         required: true
  *         schema:
  *           type: string
  *         description: Task ID
  *     responses:
  *       '204':
  *         description: Task deleted successfully
  *       '400':
  *         description: Bad Request
  *       '404':
  *         description: Employee or task not found
  *       '500':
  *         description: Internal Server Error
  */

// API to delete a task
router.delete('/:empId/tasks/:taskId', (req, res, next) => {
  try {
    let { empId, taskId } = req.params;
    empId = parseInt(empId, 10);

    // employeeId validation
    if (isNaN(empId)) {
      const err = new Error('input must be a number');
      err.status = 400;
      console.error('err', err);
      next(err);
      return;
    }

    mongo(async db => {
      let employee = await db.collection('employees').findOne({ empId });;

      // if the employee is not found
      if (!employee) {
        const err = new Error('Unable to find employee with empId ' + empId);
        err.status = 404;
        console.error('err', err);
        next(err);
        return;
      }

      if (!employee.todo) employee.todo = []; // if employee does not have a todo array create one
      if (!employee.done) employee.done = []; // if employee does not have a done array create one

      const todo = employee.todo.filter(task => task._id.toString() !== taskId.toString()); // filter the todo array
      const done = employee.done.filter(task => task._id.toString() !== taskId.toString()); // filter the done array

      // update the employee record with the new todo and done arrays
      const result = await db.collection('employees').updateOne(
        { empId },
        { $set: { todo: todo, done: done }}
      )

      res.status(204).send();
    }, next);
  } catch (err) {
    console.error('err', err);
    next(err);
  }
});

// Export router
module.exports = router;