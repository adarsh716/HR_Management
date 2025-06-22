const mongoose = require('mongoose');
const Leave = require('../models/leave');
const Employee = require('../models/employee'); 
const cloudinary = require('cloudinary').v2; 
const axios = require("axios");
const path = require("path");


function getContentType(extension) {
  const contentTypes = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".txt": "text/plain",
  };

  return contentTypes[extension.toLowerCase()] || "application/octet-stream";
}

exports.downloadDocument = async (req, res) => {
  try {
    const { leaveId } = req.params;

    if (!leaveId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID format",
      });
    }

    console.log(`Starting resume download for candidate ID: ${leaveId}`);

    const candidate = await Leave.findById(leaveId);

    console.log(candidate);

    if (!candidate) {
      console.log(`Candidate not found: ${leaveId}`);
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (!candidate.document) {
      console.log(`No resume found for candidate: ${leaveId}`);
      return res.status(404).json({
        success: false,
        message: "No resume found for this candidate",
      });
    }

    console.log(`Resume URL: ${candidate.document}`);
    console.log(
      `Resume download requested for candidate: ${candidate._id} (ID: ${leaveId}, Name: ${candidate.name})`
    );

    try {
      const response = await axios({
        method: "GET",
        url: candidate.document,
        responseType: "stream",
        timeout: 60000,
        maxRedirects: 5,
        headers: {
          "User-Agent": "Resume-Download-Service/1.0",
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
        },
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        },
      });

      console.log(
        `Successfully fetched resume from Cloudinary. Status: ${response.status}`
      );

      const urlPath = new URL(candidate.document).pathname;
      const originalExtension = path.extname(urlPath) || ".pdf";
      const sanitizedName = candidate._id
        .toString()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_");
      const filename = `${sanitizedName}_resume${originalExtension}`;

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Type", getContentType(originalExtension));

      if (response.headers["content-length"]) {
        res.setHeader("Content-Length", response.headers["content-length"]);
      }

      response.data.on("error", (streamError) => {
        console.error("Stream error during download:", streamError);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Error streaming resume file",
          });
        }
      });

      response.data.on("end", () => {
        console.log(
          `Resume successfully streamed for candidate: ${candidate.name}`
        );
      });

      response.data.pipe(res);
    } catch (fetchError) {
      console.error("Error fetching resume from Cloudinary:", {
        message: fetchError.message,
        code: fetchError.code,
        status: fetchError.response?.status,
        statusText: fetchError.response?.statusText,
        data: fetchError.response?.data,
        url: candidate.document,
      });

      if (fetchError.code === "ECONNABORTED") {
        return res.status(408).json({
          success: false,
          message:
            "Resume download timeout. The file may be too large or the connection is slow. Please try again.",
        });
      }

      if (fetchError.response?.status === 404) {
        return res.status(404).json({
          success: false,
          message:
            "Resume file not found on storage server. It may have been deleted or moved.",
        });
      }

      if (fetchError.response?.status === 403) {
        return res.status(502).json({
          success: false,
          message: `Access denied to resume file from Cloudinary. Status: ${fetchError.response.status} ${fetchError.response.statusText}. Please check Cloudinary access settings.`,
          errorDetails:
            process.env.NODE_ENV === "development"
              ? fetchError.message
              : undefined,
          cloudinaryResponse:
            process.env.NODE_ENV === "development"
              ? fetchError.response?.data
              : undefined,
        });
      }

      if (fetchError.response?.status >= 500) {
        return res.status(502).json({
          success: false,
          message: `Cloudinary server error. Status: ${fetchError.response.status} ${fetchError.response.statusText}. Please try again later.`,
          errorDetails:
            process.env.NODE_ENV === "development"
              ? fetchError.message
              : undefined,
          cloudinaryResponse:
            process.env.NODE_ENV === "development"
              ? fetchError.response?.data
              : undefined,
        });
      }

      return res.status(502).json({
        success: false,
        message:
          "Unable to fetch resume file from storage. Please check server logs for details.",
        error:
          process.env.NODE_ENV === "development"
            ? fetchError.message
            : undefined,
      });
    }
  } catch (error) {
    console.error("Download resume error (outer catch):", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while processing download request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.addLeave = async (req, res) => {
  try {
    const { employeeId, leaveDate, reason } = req.body;
    let documentUrl = '';


    if (!employeeId || !leaveDate || !reason) {
      return res.status(400).json({ message: 'All fields (employeeId, leaveDate, reason) are required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (req.files && req.files.document) {
      const file = req.files.document;
      console.log('File uploaded:', file.name, file.size);

      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: 'Invalid file type. Only PDF files are allowed.',
        });
      }

      const maxSize = 10 * 1024 * 1024; 
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

exports.getApprovedLeavesToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const leaves = await Leave.find({
      status: 'Approved',
      leaveDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), 
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

    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Pending, Approved, or Rejected' });
    }

    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      { status, updatedAt: Date.now() }, 
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

exports.getLeaveStatistics = async (req, res) => {
  try {
    const { month, year } = req.query

    console.log("Fetching leave statistics for:", { month, year })

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      })
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    console.log("Date range:", { startDate, endDate })

    // Get all leaves for the specified month
    const leaves = await Leave.find({
      leaveDate: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate("employeeId", "name email position")

    console.log("Found leaves:", leaves.length)

    // Group leaves by date
    const leavesByDate = {}
    const approvedLeaves = []

    leaves.forEach((leave) => {
      const date = new Date(leave.leaveDate)
      const day = date.getDate()

      console.log(`Processing leave for day ${day}:`, {
        employeeName: leave.employeeId.name,
        status: leave.status,
        date: leave.leaveDate,
      })

      if (!leavesByDate[day]) {
        leavesByDate[day] = {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          leaves: [],
        }
      }

      leavesByDate[day].total++
      leavesByDate[day][leave.status.toLowerCase()]++
      leavesByDate[day].leaves.push(leave)

      // Collect approved leaves for the list
      if (leave.status === "Approved") {
        approvedLeaves.push({
          id: leave._id,
          name: leave.employeeId.name,
          role: leave.employeeId.position,
          date: leave.leaveDate,
          reason: leave.reason,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.employeeId.name)}&background=random`,
        })
      }
    })

    console.log("Grouped leaves by date:", leavesByDate)
    console.log("Approved leaves:", approvedLeaves.length)

    res.status(200).json({
      success: true,
      data: {
        leavesByDate,
        approvedLeaves,
        totalLeaves: leaves.length,
      },
    })
  } catch (error) {
    console.error("Error in getLeaveStatistics:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave statistics",
      error: error.message,
    })
  }
}


