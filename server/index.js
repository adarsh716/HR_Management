const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const candidateRoutes = require("./routes/candidate");
const employeeRoutes = require("./routes/employee");
const attendanceRoutes = require("./routes/attendance");
const leaveRoutes = require("./routes/leave");
const { checkSession } = require("./controllers/authController");
const fileUpload = require('express-fileupload');

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 }, 
}));  
 
app.use(cors({
  origin: (origin, callback) => { 
    callback(null, origin); 
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH","DELETE", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/candidate", candidateRoutes); 
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", employeeRoutes);
app.use("/api/leave",leaveRoutes);

 
app.use(checkSession); 
 
connectDB();

const PORT = process.env.port || 5000;    

app.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`); 
});       