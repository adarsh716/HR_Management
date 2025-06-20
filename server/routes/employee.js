const express = require("express");
const router = express.Router();
const {
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");


router.get("/", getAllEmployees);

router.put("/:id", updateEmployee);

router.delete("/:id", deleteEmployee);

module.exports = router; 
