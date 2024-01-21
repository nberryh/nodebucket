/**
====================================================
; Title:  employee.js
; Author: Nolan Berryhill
; Date:   1/21/2024
; Description: Code to use mongo database successfully
;===================================================
*/

// Make strict
"use strict";

// Gives const a value
const express = require("express");
const router = express.Router();
const { mongo } = require("../utils/mongo");

// How the router connects with mongo
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

// Export router
module.exports = router;