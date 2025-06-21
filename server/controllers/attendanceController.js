const Attendance = require("../models/attendance");
const Employee = require("../models/employee");

exports.getAllEmployeesWithAttendance = async (req, res) => {
  try {
    const employees = await Employee.find().populate(
      "userId",
      "name department position"
    );

    const result = await Promise.all(
      employees.map(async (employee) => {
        const latestAttendance = await Attendance.findOne({
          employeeId: employee._id,
        }).sort({ createdAt: -1 });

        return {
          _id: employee._id,
          name: employee.userId.name,
          department: employee.userId.department,
          position: employee.userId.position,
          task: employee.task || "Dummy Task",
          status: latestAttendance?.status || "Absent",
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching employees with attendance", error });
  }
};


