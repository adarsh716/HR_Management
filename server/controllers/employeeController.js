const Employee = require("../models/employee");

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate("userId", "name email phone");
    res.status(200).json({ message: "Employees fetched successfully", employees });
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees", error: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updated = await Employee.findByIdAndUpdate(id, updates, { new: true }).populate("userId", "name email phone");

    if (!updated) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ message: "Employee updated successfully", employee: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating employee", error: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Employee.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Employee not found" });
    } 
 
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting employee", error: error.message });
  }
};
 