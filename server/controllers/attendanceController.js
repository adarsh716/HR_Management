const Attendance = require('../models/attendance');
const Employee = require('../models/employee');

exports.getAllEmployeesWithAttendance = async (req, res) => {
  try {
    const employees = await Employee.find().populate('userId', 'name department position');

    const result = await Promise.all(
      employees.map(async (employee) => {
        const latestAttendance = await Attendance.findOne({ employeeId: employee._id })
          .sort({ createdAt: -1 });

        return {
          _id: employee._id,
          name: employee.userId.name,
          department: employee.userId.department,
          position: employee.userId.position,
          task: employee.task || '--',
          status: latestAttendance?.status || 'Absent', 
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees with attendance', error });
  }
};


exports.updateAttendanceStatus = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status } = req.body;
    
    console.log("Updating attendance for employee:", employeeId, "with status:", status);


    if (!["Present", "Absent", "Half-Day"].includes(status)) {
      return res.status(400).json({ message: "Invalid attendance status" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    console.log(
      `Updating attendance for employee: ${employeeId} with status: ${status} by user: ${req.user.id}`
    );

    const attendance = new Attendance({
      employeeId,
      status,
    });

    await attendance.save();

    res.status(200).json({ message: "Attendance updated successfully", attendance });
  } catch (error) {
    console.error("Update attendance error:", error.message);
    res.status(500).json({ message: "Failed to update attendance", error: error.message });
  }
};
