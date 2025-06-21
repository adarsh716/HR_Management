const Candidate = require("../models/candidate");
const Employee = require("../models/employee");
const cloudinary = require("cloudinary").v2;
const axios = require("axios");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const getContentType = (extension) => {
  const ext = extension.toLowerCase().replace(".", "");
  const contentTypes = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    rtf: "application/rtf",
    odt: "application/vnd.oasis.opendocument.text",
  };

  return contentTypes[ext] || "application/octet-stream";
};

exports.createCandidate = async (req, res) => {
  const { name, email, phone, position, experience } = req.body;

  console.log("Received candidate data:", {
    name,
    email,
    phone,
    position,
    experience,
  });

  let resumeUrl = "";

  try {
    if (!name || !email || !phone || !position || !experience) {
      return res.status(400).json({
        message:
          "Missing required fields: name, email, phone, position, and experience are required",
      });
    }

    if (req.files && req.files.resume) {
      const file = req.files.resume;
      console.log("File uploaded:", file.name, file.size);

      const allowedTypes = ["application/pdf"];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only PDF files are allowed.",
        });
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return res.status(400).json({ 
          message: "File too large. Maximum size is 10MB.",
        });
      }

      try {
        const uploadResult = await cloudinary.uploader.upload(
          file.tempFilePath,
          {
            public_id: `candidate_resume_${Date.now()}`,
            folder: "candidate_resumes",
            resource_type: "raw",
            format: "pdf",
            use_filename: false,
            type: "upload", 
            access_mode: "public",  
            overwrite: true,
          }
        );
        resumeUrl = uploadResult.secure_url;
        console.log("Uploaded Resume URL:", resumeUrl);
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res.status(500).json({
          message: "Failed to upload resume",
          error: uploadError.message,
        });
      }
    } else {
      return res.status(400).json({
        message: "Resume file is required",
      });
    }

    // const candidateExists = await Candidate.findOne({ email });
    // if (candidateExists)
    //   return res.status(400).json({ msg: "Candidate already exists" });

    const candidate = new Candidate({
      name,
      email,
      phone,
      position,
      experience,
      resume: resumeUrl,
    });

    const savedCandidate = await candidate.save();
    console.log("Saved Candidate:", savedCandidate._id);

    res.status(201).json({
      message: "Candidate created successfully",
      candidate: savedCandidate,
    });
  } catch (error) {
    console.error("Error while creating candidate:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Internal server error while creating candidate",
      error: error.message,
    });
  }
};

exports.getAllCandidates = async (req, res) => {
  try {
    // if (req.user.role !== "HR") {
    //   return res.status(403).json({ message: "Only HR can view candidates" });
    // }

    const candidates = await Candidate.find();
    res.json({ message: "Candidates retrieved successfully", candidates });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  const { id } = req.params;

  try {
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (candidate.resume) {
      const publicId = candidate.resume.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`candidate_resumes/${publicId}`, {
        resource_type: "raw",
      });
    }

    await Candidate.findByIdAndDelete(id);
    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.downloadResume = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID format",
      });
    }

    console.log(`Starting resume download for candidate ID: ${candidateId}`);

    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      console.log(`Candidate not found: ${candidateId}`);
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (!candidate.resume) {
      console.log(`No resume found for candidate: ${candidateId}`);
      return res.status(404).json({
        success: false,
        message: "No resume found for this candidate",
      });
    }

    console.log(`Resume URL: ${candidate.resume}`);
    console.log(
      `Resume download requested for candidate: ${candidate.name} (ID: ${candidateId})`
    );

    try {

      const response = await axios({
        method: "GET",
        url: candidate.resume,
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


      const urlPath = new URL(candidate.resume).pathname;
      const originalExtension = path.extname(urlPath) || ".pdf";
      const sanitizedName = candidate.name
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
        data: fetchError.response?.data, // Include response data for more details
        url: candidate.resume,
      });

      // Handle specific error cases
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

      // If Cloudinary returns 403 (Forbidden), it means your server can't access it.
      // This is often due to Cloudinary settings for raw files or incorrect public_id.
      if (fetchError.response?.status === 403) {
        return res.status(502).json({
          // Return 502 Bad Gateway to client
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

      // Handle general Cloudinary server errors (5xx)
      if (fetchError.response?.status >= 500) {
        return res.status(502).json({
          // Return 502 Bad Gateway to client
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

      // Generic error for other Axios issues (e.g., DNS, no connection)
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
    console.error("Download resume error (outer catch):", error); // This catch block for errors *before* axios.get
    res.status(500).json({
      success: false,
      message: "Internal server error while processing download request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
exports.changeCandidateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.status = status;
    await candidate.save();

    if (status === "Selected") {
      const existingEmployee = await Employee.findOne({ userId: id });
      if (existingEmployee) {
        return res.status(400).json({
          message: "Candidate is already an employee",
          candidate,
          employee: existingEmployee,
        });
      }

      const newEmployee = new Employee({
        userId: id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        department: req.body.department || "To be assigned",
        position: candidate.position || "To be assigned",
        hireDate: req.body.hireDate || new Date(),
        role: "Employee",
        status: "Active",
      });

      await newEmployee.save();

      return res.json({
        message:
          "Candidate status updated to selected and employee record created",
        candidate,
        employee: newEmployee,
      });
    }

    res.json({ message: "Candidate status updated successfully", candidate });
  } catch (error) {
    console.error("Error updating candidate status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
