const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/', attendanceController.getAllEmployeesWithAttendance);

router.put('/:employeeId', attendanceController.updateAttendanceStatus);

module.exports = router;
