const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

router.post('/leaves', leaveController.addLeave);

router.get('/employees/search', leaveController.searchEmployee);

router.get('/leaves', leaveController.getAllLeaves);

router.get('/leaves/approved-today', leaveController.getApprovedLeavesToday);

router.put('/leaves/:id', leaveController.updateLeaveStatus);

module.exports = router;