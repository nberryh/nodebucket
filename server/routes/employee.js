/**
====================================================
; Title:  employee.js
; Author: Nolan Berryhill
; Date:   1/22/2024
; Description: Code to use mongo database successfully
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