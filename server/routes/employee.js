/**
====================================================
; Title:  employee.js
; Author: Nolan Berryhill
; Date:   1/28/2024
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
})

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
})

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

//ajv schema validation
const taskSchema = {
  type: 'object',
  properties: {
    text: { type: 'string'}
  },
  required: ['text'],
  additionalProperties: false
}

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
})

// Export router
module.exports = router;