const mongoose = require('mongoose');
const Leave = require('../models/leave');
const Employee = require('../models/employee'); // Assuming Employee model exists

// Add a new leave request
exports.addLeave = async (req, res) => {
  try {
    const { employeeId, leaveDate, reason } = req.body;
    let documentUrl = '';

    // Validate required fields (document is now optional but validated if uploaded)
    if (!employeeId || !leaveDate || !reason) {
      return res.status(400).json({ message: 'All fields (employeeId, leaveDate, reason) are required' });
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Handle document upload if provided
    if (req.files && req.files.document) {
      const file = req.files.document;
      console.log('File uploaded:', file.name, file.size);

      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: 'Invalid file type. Only PDF files are allowed.',
        });
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return res.status(400).json({
          message: 'File too large. Maximum size is 10MB.',
        });
      }

      try {
        const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
          public_id: `leave_document_${Date.now()}`,
          folder: 'leave_documents',
          resource_type: 'raw',
          format: 'pdf',
          use_filename: false,
          type: 'upload',
          access_mode: 'public',
          overwrite: true,
        });
        documentUrl = uploadResult.secure_url;
        console.log('Uploaded Document URL:', documentUrl);
      } catch (uploadError) {
        console.error('Cloudinary Upload Error:', uploadError);
        return res.status(500).json({
          message: 'Failed to upload document',
          error: uploadError.message,
        });
      }
    } else {
      return res.status(400).json({
        message: 'Document file is required',
      });
    }

    const leave = new Leave({
      employeeId,
      leaveDate,
      reason,
      document: documentUrl,
    });

    await leave.save();
    res.status(201).json({ message: 'Leave request added successfully', leave });
  } catch (error) {
    console.error('Add leave error:', error.message);
    res.status(500).json({ message: 'Failed to add leave request', error: error.message });
  }
};


exports.searchEmployee = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const employees = await Employee.find({
      $or: [
        { _id: query }, 
        { name: { $regex: query, $options: 'i' } }, 
      ],
    }).limit(10); 

    if (!employees.length) {
      return res.status(404).json({ message: 'No employees found' });
    }

    res.status(200).json({ employees });
  } catch (error) {
    console.error('Search employee error:', error.message);
    res.status(500).json({ message: 'Failed to search employees', error: error.message });
  }
};


exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate('employeeId', 'name');
    res.status(200).json({ leaves });
  } catch (error) {
    console.error('Fetch all leaves error:', error.message);
    res.status(500).json({ message: 'Failed to fetch leaves', error: error.message });
  }
};

// Fetch approved leaves for today
exports.getApprovedLeavesToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today (10:42 AM IST on June 21, 2025)

    const leaves = await Leave.find({
      status: 'Approved',
      leaveDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // End of today
      },
    }).populate('employeeId', 'name');

    res.status(200).json({ leaves });
  } catch (error) {
    console.error('Fetch approved leaves today error:', error.message);
    res.status(500).json({ message: 'Failed to fetch approved leaves', error: error.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;


    if (!leaveId || !status) {
      return res.status(400).json({ message: 'leaveId and status are required' });
    }

    // Validate status enum
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Pending, Approved, or Rejected' });
    }

    // Find and update leave
    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      { status, updatedAt: Date.now() }, // Update status and timestamps
      { new: true, runValidators: true }
    ).populate('employeeId', 'name');

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.status(200).json({ message: 'Leave status updated successfully', leave });
  } catch (error) {
    console.error('Update leave status error:', error.message);
    res.status(500).json({ message: 'Failed to update leave status', error: error.message });
  }
};