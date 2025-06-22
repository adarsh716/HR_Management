const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

router.post('/leaves', leaveController.addLeave);

router.get('/leaves/fetch', leaveController.getAllLeaves);

router.get('/employees/search', leaveController.searchEmployee);

router.get('/leaves/approved-today', leaveController.getApprovedLeavesToday);

router.patch('/leaves/:leaveId', leaveController.updateLeaveStatus);

router.get("/leaves/statistics", leaveController.getLeaveStatistics);

router.get("/download-document/:leaveId", leaveController.downloadDocument);

module.exports = router;