const Candidate = require("../models/candidate");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

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

    res
      .status(201)
      .json({
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
