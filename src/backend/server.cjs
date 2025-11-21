require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");

const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "60929193374-3paeve0ig0pqcenie8gdsh6k1b53hj91.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// MySQL connection using .env for config
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "CustomerSatisfactionSurvey",
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // reads EMAIL_USER from .env
    pass: process.env.EMAIL_PASS  // reads EMAIL_PASS from .env
  },
  tls: {
    rejectUnauthorized: false
  }
});


function randomCode(length = 6) {
  return Math.random().toString().substring(2, 2 + length).padEnd(length, '0').substring(0, length);
}

function validatePassword(password) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-z]/.test(password)) return "Add a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Add an uppercase letter.";
  if (!/[0-9]/.test(password)) return "Add a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Add a symbol.";
  return "strong";
}

async function initializeDatabase() {
  try {
    // Create survey_questions table
    await db.query(`CREATE TABLE IF NOT EXISTS survey_questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      field_name VARCHAR(100) UNIQUE NOT NULL,
      section VARCHAR(100),
      question_text TEXT NOT NULL,
      field_type VARCHAR(50),
      is_required BOOLEAN DEFAULT TRUE,
      options LONGTEXT,
      \`rows\` LONGTEXT,
      \`columns\` LONGTEXT,
      instruction TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    // Create survey_responses table (replaces submissions)
    await db.query(`CREATE TABLE IF NOT EXISTS survey_responses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_email VARCHAR(255),
      user_name VARCHAR(100),
      client_type VARCHAR(50),
      gender VARCHAR(50),
      age INT,
      region VARCHAR(100),
      service VARCHAR(255),
      cc_awareness INT,
      cc_visibility INT,
      cc_helpfulness INT,
      sqd_ratings LONGTEXT,
      suggestions TEXT,
      feedback_email VARCHAR(255),
      average_satisfaction DECIMAL(3,2),
      response_data LONGTEXT,
      status VARCHAR(32) DEFAULT 'Completed',
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_user_email (user_email),
      KEY idx_region (region),
      KEY idx_submitted_at (submitted_at)
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS admin_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_email VARCHAR(255),
      admin_name VARCHAR(100),
      action TEXT,
      log_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      KEY idx_time (log_time)
    )`);

    try {
      await db.query(`ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS admin_name VARCHAR(100)`);
    } catch (e) {
      // Column may already exist, ignore error
    }

    await db.query(`CREATE TABLE IF NOT EXISTS help_feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_email VARCHAR(255),
      user_name VARCHAR(100),
      feedback_type VARCHAR(50),
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'New',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS faqs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category VARCHAR(100),
      is_published BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS survey_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) UNIQUE,
      setting_value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      notification_type VARCHAR(50),
      message TEXT,
      user_email VARCHAR(255),
      user_name VARCHAR(100),
      is_read BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      KEY idx_created_at (created_at)
    )`);

    await db.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      fullName VARCHAR(100),
      district VARCHAR(50),
      barangay VARCHAR(50),
      isAdmin BOOLEAN DEFAULT FALSE,
      role VARCHAR(100),
      reset_code VARCHAR(10),
      reset_code_expiry BIGINT,
      email_verified BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log("Database tables initialized successfully");
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}
initializeDatabase();

// --- Ensure default admins and test user exist ---
async function ensureSeedUsers() {
  const admins = [
    {
      email: "basartejasmine@gmail.com",
      password: "AppDev_*",
      fullName: "Jasmine Basarte",
      isAdmin: true,
      role: "superadmin"
    },
    {
      email: "akcinaj.14.macam@gmail.com",
      password: "Support123!",
      fullName: "Janicka Akim Macam",
      isAdmin: true,
      role: "support"
    },
    {
      email: "rodelynjulia@gmail.com",
      password: "SurveyAdmin123!",
      fullName: "Rodelyn Julia",
      isAdmin: true,
      role: "surveyadmin"
    },
    {
      email: "angel316.aep@gmail.com",
      password: "ReportView123!",
      fullName: "Angel Patawaran",
      isAdmin: true,
      role: "analyst"
    }
  ];
  
  const surveyUser = {
    email: "janraizenb@gmail.com",
    password: "SurveyTest!123",
    fullName: "Jan Raizen Buenaventura",
    isAdmin: false,
    role: "user"
  };

  for (const u of [...admins, surveyUser]) {
    // Get full user data in one query
    const [rows] = await db.query("SELECT id, password, role, isAdmin, fullName, email_verified FROM users WHERE email = ?", [u.email]);
    if (!rows.length) {
      // Create new user with hashed password
      const hash = await bcrypt.hash(u.password, 10);
      // Assume admins are verified on seed, regular users need email verification.
      const emailVerified = u.role === "user" ? false : true; 
      await db.query(
        "INSERT INTO users (email, password, fullName, isAdmin, role, email_verified) VALUES (?, ?, ?, ?, ?, ?)",
        [u.email, hash, u.fullName, u.isAdmin, u.role, emailVerified]
      );
      console.log("Seeded new user:", u.email, u.role, "Verified:", emailVerified);
    } else {
      // Update existing user - ensure password is hashed and role is set
      const existingUser = rows[0];
      
      let needsUpdate = false;
      let updateFields = [];
      let updateValues = [];
      
      // Check if password needs to be updated (if it's not hashed or wrong)
      const isPasswordHashed = existingUser.password && existingUser.password.startsWith('$2');
      if (!isPasswordHashed) {
        // Password is not hashed, update it
        const hash = await bcrypt.hash(u.password, 10);
        updateFields.push("password = ?");
        updateValues.push(hash);
        needsUpdate = true;
      } else {
        // Verify the password matches - if not, update it
        try {
          const match = await bcrypt.compare(u.password, existingUser.password);
          if (!match) {
            const hash = await bcrypt.hash(u.password, 10);
            updateFields.push("password = ?");
            updateValues.push(hash);
            needsUpdate = true;
          }
        } catch (err) {
          // If comparison fails, update password
          const hash = await bcrypt.hash(u.password, 10);
          updateFields.push("password = ?");
          updateValues.push(hash);
          needsUpdate = true;
        }
      }
      
      // Always ensure isAdmin is set correctly for admin users
      if (u.isAdmin) {
        // Check if isAdmin needs to be updated (handle both boolean and int from DB)
        const currentIsAdmin = existingUser.isAdmin === 1 || existingUser.isAdmin === true;
        if (currentIsAdmin !== u.isAdmin) {
          updateFields.push("isAdmin = ?");
          updateValues.push(u.isAdmin ? 1 : 0);
          needsUpdate = true;
        }
        
        // Only set role if user doesn't have a role yet (preserve existing roles) or if it's explicitly different
        if (!existingUser.role || existingUser.role === null || existingUser.role === '' || existingUser.role !== u.role) {
          updateFields.push("role = ?");
          updateValues.push(u.role);
          needsUpdate = true;
        }
      }
      
      // Update fullName if provided and different
      if (u.fullName && existingUser.fullName !== u.fullName) {
        updateFields.push("fullName = ?");
        updateValues.push(u.fullName);
        needsUpdate = true;
      }
      
      // Ensure email_verified is handled correctly
      // For seeded admins, they should be verified. For the survey user, they will need verification.
      const desiredVerifiedStatus = u.role === "user" ? false : true;
      if (existingUser.email_verified !== desiredVerifiedStatus) {
        updateFields.push("email_verified = ?");
        updateValues.push(desiredVerifiedStatus ? 1 : 0);
        needsUpdate = true;
        console.log(`User ${u.email} verification status updated to ${desiredVerifiedStatus}`);
      }
      
      if (needsUpdate) {
        updateValues.push(u.email);
        await db.query(
          `UPDATE users SET ${updateFields.join(", ")} WHERE email = ?`,
          updateValues
        );
        console.log("Updated user:", u.email, "Fields:", updateFields.join(", "));
      }
    }
  }
}
ensureSeedUsers();

app.get("/api/submissions/:email", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, user_name, region, client_type, gender, age, service, 
              average_satisfaction, status, submitted_at, response_data 
       FROM survey_responses 
       WHERE user_email = ? 
       ORDER BY submitted_at DESC`,
      [req.params.email]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

app.get("/api/admin/submissions", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, user_email, user_name, region, client_type, gender, age, service,
              cc_awareness, cc_visibility, cc_helpfulness,
              average_satisfaction, status, submitted_at, sqd_ratings, response_data
       FROM survey_responses 
       ORDER BY submitted_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

app.get("/api/submissions/detail/:id", async (req, res) => {
  try {
    const [[row]] = await db.query(
      "SELECT * FROM survey_responses WHERE id = ?",
      [req.params.id]
    );
    if (!row) return res.status(404).json({ error: "Not found" });
    row.response_data = row.response_data ? JSON.parse(row.response_data) : {};
    row.sqd_ratings = row.sqd_ratings ? JSON.parse(row.sqd_ratings) : {};
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch submission" });
  }
});

app.put("/api/submissions/:id", async (req, res) => {
  const { user_email, responses } = req.body;
  try {
    const [[row]] = await db.query(
      "SELECT user_email, user_name FROM survey_responses WHERE id = ?",
      [req.params.id]
    );
    if (!row || row.user_email !== user_email) {
      return res.status(403).json({ error: "Forbidden" });
    }

    let avgSatisfaction = 0;
    if (responses.sqdRatings) {
      const ratings = Object.values(responses.sqdRatings)
        .filter(r => r !== 'NA' && typeof r === 'number')
        .map(r => r);
      if (ratings.length > 0) {
        avgSatisfaction = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
      }
    }

    await db.query(
      `UPDATE survey_responses SET
       client_type = ?, gender = ?, age = ?, region = ?, service = ?,
       cc_awareness = ?, cc_visibility = ?, cc_helpfulness = ?,
       sqd_ratings = ?, suggestions = ?, feedback_email = ?,
       average_satisfaction = ?, response_data = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        responses.clientType,
        responses.gender,
        responses.age,
        responses.region,
        responses.service,
        responses.ccAwareness,
        responses.ccVisibility,
        responses.ccHelpfulness,
        JSON.stringify(responses.sqdRatings || {}),
        responses.suggestions,
        responses.email,
        avgSatisfaction,
        JSON.stringify(responses),
        req.params.id
      ]
    );

    await db.query(
      "INSERT INTO notifications (notification_type, message, user_email, user_name) VALUES (?, ?, ?, ?)",
      ["survey_edited", `Survey submission updated by ${responses.fullName || row.user_name || "User"}`, user_email, responses.fullName || row.user_name || "User"]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update submission" });
  }
});

app.delete("/api/submissions/:id", async (req, res) => {
  const { user_email } = req.body;
  try {
    const [[row]] = await db.query(
      "SELECT user_email, user_name FROM survey_responses WHERE id = ?",
      [req.params.id]
    );
    if (!row || row.user_email !== user_email) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    await db.query(
      "INSERT INTO notifications (notification_type, message, user_email, user_name) VALUES (?, ?, ?, ?)",
      ["survey_deleted", `Survey submission deleted by ${row.user_name || "User"}`, user_email, row.user_name || "User"]
    );

    await db.query("DELETE FROM survey_responses WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete submission" });
  }
});

app.get("/api/admin/analytics", async (req, res) => {
  try {
    const { serviceFilter, regionFilter, dateFilter } = req.query;
    let whereClause = "WHERE 1=1";
    const params = [];

    if (serviceFilter) {
      whereClause += " AND service = ?";
      params.push(serviceFilter);
    }
    if (regionFilter) {
      whereClause += " AND region = ?";
      params.push(regionFilter);
    }
    if (dateFilter) {
      whereClause += " AND DATE(submitted_at) = ?";
      params.push(dateFilter);
    }

    const [allResponses] = await db.query(`SELECT * FROM survey_responses ${whereClause}`, params);
    const [total] = await db.query(`SELECT COUNT(*) as count FROM survey_responses ${whereClause}`, params);
    const [avgSat] = await db.query(`SELECT AVG(average_satisfaction) as avg FROM survey_responses ${whereClause}`, params);

    // Calculate distributions
    const byRegion = {};
    const byGender = {};
    const byClientType = {};
    const sqdDistribution = {};

    allResponses.forEach(r => {
      if (r.region) byRegion[r.region] = (byRegion[r.region] || 0) + 1;
      if (r.gender) byGender[r.gender] = (byGender[r.gender] || 0) + 1;
      if (r.client_type) byClientType[r.client_type] = (byClientType[r.client_type] || 0) + 1;

      try {
        const sqdRatings = typeof r.sqd_ratings === "string" ? JSON.parse(r.sqd_ratings) : r.sqd_ratings || {};
        Object.entries(sqdRatings).forEach(([key, val]) => {
          if (val !== "NA" && typeof val === "number") {
            sqdDistribution[key] = (sqdDistribution[key] || 0) + 1;
          }
        });
      } catch (e) {}
    });

    res.json({
      totalResponses: total[0].count,
      averageSatisfaction: avgSat[0].avg || 0,
      byRegion: Object.entries(byRegion).map(([region, count]) => ({ region, count })),
      byGender: Object.entries(byGender).map(([gender, count]) => ({ gender, count })),
      byClientType: Object.entries(byClientType).map(([client_type, count]) => ({ client_type, count })),
      sqdDistribution: Object.entries(sqdDistribution).map(([name, count]) => ({ name, count }))
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

app.get("/api/admin/logs", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, admin_email, admin_name, action, log_time 
       FROM admin_logs 
       ORDER BY log_time DESC 
       LIMIT 1000`
    );
    
    res.json(rows.map(row => ({
      id: row.id,
      admin_email: row.admin_email,
      admin_name: row.admin_name || "System",
      action: row.action,
      log_time: row.log_time
    })));
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

app.get("/api/admin/logs/:email", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM admin_logs WHERE admin_email = ? ORDER BY log_time DESC LIMIT 50",
      [req.params.email]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// --- Register user ---
app.post("/api/register", async (req, res) => {
  const { email, password, fullName, district, barangay } = req.body;
  const pwdCheck = validatePassword(password);
  if (pwdCheck !== "strong") return res.status(400).json({ error: pwdCheck });
  
  try {
    // Check if email already exists
    const [existingUsers] = await db.query("SELECT id, email_verified FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      // If user exists and is verified, inform them to log in.
      // If user exists but is not verified, prompt them to check their email for verification code.
      if (existingUsers[0].email_verified) {
        return res.status(409).json({ error: "Email already registered. Please log in." });
      } else {
        return res.status(409).json({ error: "Email already registered. Please verify your email. Check your inbox for the verification code." });
      }
    }
    
    const hash = await bcrypt.hash(password, 10);
    const verificationCode = randomCode(6);
    const codeExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    await db.query(
      "INSERT INTO users (email, password, fullName, district, barangay, role, reset_code, reset_code_expiry, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [email, hash, fullName, district, barangay, "user", verificationCode, codeExpiry, false] // email_verified is false by default
    );
    
    let emailSent = false;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your Email - Customer Satisfaction Survey",
        html: `
          <h2>Welcome ${fullName}!</h2>
          <p>Thank you for registering with our Customer Satisfaction Survey application.</p>
          <p><strong>Your email verification code is:</strong></p>
          <h1 style="color: #007bff; letter-spacing: 5px;">${verificationCode}</h1>
          <p>This code will expire in 24 hours.</p>
          <p>If you did not register for this account, please ignore this email.</p>
        `
      });
      console.log("Verification email sent to:", email);
      emailSent = true;
    } catch (emailErr) {
      console.error("Email sending error:", emailErr);
      emailSent = false;
    }
    
    if (!emailSent) {
      // Delete the user we just created since email failed
      await db.query("DELETE FROM users WHERE email = ?", [email]);
      return res.status(500).json({ error: "Failed to send verification email. Registration cancelled. Please try again." });
    }
    
    res.status(200).json({ ok: true, message: "Registration successful. Please verify your email." });
  } catch (err) {
    console.error("Register error:", err);
    res.status(400).json({ error: "Registration failed. Please try again." });
  }
});

app.post("/api/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;
    const [[user]] = await db.query(
      "SELECT reset_code, reset_code_expiry, email_verified FROM users WHERE email = ?", [email]
    );
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (user.reset_code === code && Date.now() < Number(user.reset_code_expiry)) {
      await db.query(
        "UPDATE users SET reset_code = NULL, reset_code_expiry = NULL, email_verified = TRUE WHERE email = ?", [email]
      );
      res.status(200).json({ ok: true });
    } else {
      res.status(400).json({ error: "Code invalid or expired" });
    }
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ error: "Server error during email verification" });
  }
});

// --- Login ---
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    const [[user]] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    if (!user) {
      console.log("Login failed: User not found for email:", email);
      return res.status(401).json({ error: "Incorrect email or password" });
    }
    
    if (!user.email_verified) {
      return res.status(403).json({ error: "Please verify your email first. Check your inbox for the verification code." });
    }
    
    // Check if password is hashed (starts with $2)
    const isPasswordHashed = user.password && user.password.startsWith('$2');
    if (!isPasswordHashed) {
      console.log("Login failed: Password not hashed for user:", email);
      // If password is not hashed, hash it now and update the user
      const hash = await bcrypt.hash(password, 10);
      await db.query("UPDATE users SET password = ? WHERE email = ?", [hash, email]);
      // Try to compare again
      const match = await bcrypt.compare(password, hash);
      if (!match) {
        return res.status(401).json({ error: "Incorrect email or password" });
      }
    } else {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        console.log("Login failed: Password mismatch for user:", email);
        return res.status(401).json({ error: "Incorrect email or password" });
      }
    }
    
    console.log("Login successful for:", email, "Role:", user.role, "isAdmin:", user.isAdmin);
    res.json({
      email: user.email,
      fullName: user.fullName,
      district: user.district,
      barangay: user.barangay,
      isAdmin: !!user.isAdmin,
      role: user.role
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

app.post("/api/login/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Missing Google credential" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase();
    const fullName = payload?.name || `${payload?.given_name || ""} ${payload?.family_name || ""}`.trim();

    if (!email) {
      return res.status(400).json({ error: "Google account email not available" });
    }

    const [[existingUser]] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    let userRecord = existingUser;

    if (!existingUser) {
      const placeholderPassword = await bcrypt.hash(payload?.sub || email, 10);
      const [insertResult] = await db.query(
        "INSERT INTO users (email, password, fullName, isAdmin, role, email_verified) VALUES (?, ?, ?, ?, ?, ?)",
        [email, placeholderPassword, fullName || email, false, "user", true]
      );
      const [[createdUser]] = await db.query("SELECT * FROM users WHERE id=?", [insertResult.insertId]);
      userRecord = createdUser;
    } else if (fullName && !existingUser.fullName) {
      await db.query("UPDATE users SET fullName=? WHERE email=?", [fullName, email]);
      userRecord = { ...existingUser, fullName };
    } else if (existingUser && !existingUser.email_verified) {
        // If user exists but is not verified (e.g., registered via form then tried google login)
        await db.query("UPDATE users SET email_verified = TRUE WHERE email = ?", [email]);
        userRecord = { ...existingUser, email_verified: true };
    }

    res.json({
      email: userRecord.email,
      fullName: userRecord.fullName || fullName || userRecord.email,
      district: userRecord.district,
      barangay: userRecord.barangay,
      isAdmin: !!userRecord.isAdmin,
      role: userRecord.role,
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ error: "Google authentication failed" });
  }
});

app.put("/api/user/profile", async (req, res) => {
  try {
    const { email, fullName, district, barangay } = req.body;
    await db.query(
      "UPDATE users SET fullName=?, district=?, barangay=? WHERE email=?",
      [fullName, district, barangay, email]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// --- Forgot Password (Send Reset Code) ---
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const pinCode = randomCode(6);
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    
    const [rows] = await db.query("SELECT id, fullName, email_verified FROM users WHERE email = ?", [email]);
    if (!rows.length) {
      // Don't reveal if email exists
      return res.status(200).json({ ok: true });
    }
    
    const user = rows[0];
    // Only send reset code if the email is verified
    if (!user.email_verified) {
        return res.status(403).json({ error: "Please verify your email before resetting your password." });
    }

    await db.query(
      "UPDATE users SET reset_code = ?, reset_code_expiry = ? WHERE email = ?",
      [pinCode, expiresAt, email]
    );
    
    let emailSent = false;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Code - Customer Satisfaction Survey",
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${user.fullName},</p>
          <p>We received a request to reset your password. Here is your password reset code:</p>
          <h1 style="color: #dc3545; letter-spacing: 10px; font-size: 36px;">${pinCode}</h1>
          <p><strong>This code will expire in 15 minutes.</strong></p>
          <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
          <hr>
          <p><small>This is an automated message, please do not reply.</small></p>
        `
      });
      console.log("Reset email sent to:", email);
      emailSent = true;
    } catch (emailErr) {
      console.error("Email sending error:", emailErr);
      emailSent = false;
    }
    
    if (!emailSent) {
      // Clear the reset code we just set since email failed
      await db.query("UPDATE users SET reset_code = NULL, reset_code_expiry = NULL WHERE email = ?", [email]);
      return res.status(500).json({ error: "Failed to send reset email. Please try again." });
    }
    
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Forgot pass error:", err);
    res.status(400).json({ error: "Failed to send reset code" });
  }
});

// --- Verify Reset Code ---
app.post("/api/verify-reset-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    const [[user]] = await db.query(
      "SELECT reset_code, reset_code_expiry, email_verified FROM users WHERE email=?", [email]
    );
    if (
      user &&
      user.reset_code === code &&
      Date.now() < Number(user.reset_code_expiry) &&
      user.email_verified // Ensure the user's email is verified
    ) {
      res.status(200).json({ ok: true });
    } else {
      res.status(400).json({ error: "Code invalid or expired" });
    }
  } catch (err) {
    console.error("Verify code error:", err);
    res.status(500).json({ error: "Server error during code check" });
  }
});

// --- Reset Password Handler ---
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const [[user]] = await db.query(
      "SELECT reset_code, reset_code_expiry, email_verified FROM users WHERE email=?", [email]
    );
    if (
      user &&
      user.reset_code === code &&
      Date.now() < Number(user.reset_code_expiry) &&
      user.email_verified // Ensure the user's email is verified
    ) {
      const pwdCheck = validatePassword(newPassword);
      if (pwdCheck !== "strong") return res.status(400).json({ error: pwdCheck });
      const hash = await bcrypt.hash(newPassword, 10);
      await db.query(
        "UPDATE users SET password=?, reset_code=NULL, reset_code_expiry=NULL WHERE email=?",
        [hash, email]
      );
      res.status(200).json({ ok: true });
    } else {
      res.status(400).json({ error: "Code invalid or expired" });
    }
  } catch (err) {
    console.error("Reset pass error:", err);
    res.status(500).json({ error: "Server error during password reset" });
  }
});

// --- Update admin role (SuperAdmin only) ---
app.post("/api/admin/update-role", async (req, res) => {
  const { requesterEmail, requesterRole, targetEmail, newRole } = req.body;

  const requesterRoleLower = requesterRole?.toLowerCase() || "";
  
  // Only superadmin/system admin can update roles, and cannot update their own role
  if ((requesterRoleLower !== "superadmin" && requesterRoleLower !== "system admin") || requesterEmail === targetEmail) {
    return res.status(403).json({ error: "Forbidden: Only System Administrator can update roles" });
  }

  // Get target user's current role for logging
  const [[targetUser]] = await db.query("SELECT fullName, role, email_verified FROM users WHERE email=?", [targetEmail]);
  if (!targetUser) {
    return res.status(404).json({ error: "User not found" });
  }
  
  const oldRole = targetUser.role || "none";
  
  // Prevent changing role of unverified users if necessary (optional, depending on requirements)
  if (!targetUser.email_verified && requesterRoleLower === "superadmin") {
      // Example: Superadmin can still change role, but other admins might not be able to.
      // Add specific logic here if needed.
  }
  
  // Update the role in the database
  await db.query("UPDATE users SET role=? WHERE email=?", [newRole, targetEmail]);
  
  // Get requester's name for logging
  const [[requester]] = await db.query("SELECT fullName FROM users WHERE email=?", [requesterEmail]);
  await logAdminAction(requesterEmail, requester?.fullName || "System", `Updated role for ${targetUser.fullName || targetEmail} (${targetEmail}) from "${oldRole}" to "${newRole}"`);
  
  res.json({ ok: true, message: `Role updated from ${oldRole} to ${newRole}` });
});

app.get("/api/admin/users", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT email, fullName, role, isAdmin, email_verified FROM users WHERE isAdmin = TRUE ORDER BY email"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

app.get("/api/admin/list", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT email, fullName, role, isAdmin, DATE(DATE_ADD(created_at, INTERVAL 0 DAY)) as created_at, email_verified FROM users WHERE isAdmin = TRUE"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin list" });
  }
});

app.get("/api/admin/stats", async (req, res) => {
  try {
    const [totalResponses] = await db.query(
      "SELECT COUNT(*) as count FROM survey_responses"
    );
    const [avgSatisfaction] = await db.query(
      "SELECT AVG(average_satisfaction) as avg FROM survey_responses"
    );
    const [recentAdmins] = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE isAdmin = TRUE"
    );
    const [unverifiedUsers] = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE email_verified = FALSE AND password IS NOT NULL" // Exclude users who registered via Google
    );


    res.json({
      surveys: {
        active: 1,
        drafts: 0,
        closed: 0
      },
      responses: {
        total: totalResponses[0].count,
        avgSatisfaction: avgSatisfaction[0].avg || 0
      },
      profile: {
        activeUsers: recentAdmins[0].count,
        userCount: recentAdmins[0].count,
        respondents: totalResponses[0].count
      },
      reports: {
        submitted: totalResponses[0].count,
        drafts: 0
      },
      users: {
        unverified: unverifiedUsers[0].count,
        admins: recentAdmins[0].count
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get("/api/faqs", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM faqs WHERE is_published = TRUE ORDER BY category"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

app.get("/api/admin/faqs", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM faqs ORDER BY category");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

app.post("/api/admin/faqs", async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    await db.query(
      "INSERT INTO faqs (question, answer, category) VALUES (?, ?, ?)",
      [question, answer, category]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to create FAQ" });
  }
});

app.put("/api/admin/faqs/:id", async (req, res) => {
  try {
    const { question, answer, category, is_published } = req.body;
    await db.query(
      "UPDATE faqs SET question=?, answer=?, category=?, is_published=? WHERE id=?",
      [question, answer, category, is_published, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update FAQ" });
  }
});

app.delete("/api/admin/faqs/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM faqs WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
});

app.post("/api/help-feedback", async (req, res) => {
  try {
    const { user_email, user_name, feedback_type, message } = req.body;
    await db.query(
      "INSERT INTO help_feedback (user_email, user_name, feedback_type, message) VALUES (?, ?, ?, ?)",
      [user_email || null, user_name || null, feedback_type, message]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

app.get("/api/admin/help-feedback", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM help_feedback ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

app.put("/api/admin/help-feedback/:id", async (req, res) => {
  try {
    const { status } = req.body;
    await db.query(
      "UPDATE help_feedback SET status=?, updated_at=NOW() WHERE id=?",
      [status, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update feedback" });
  }
});

app.get("/api/settings", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT setting_key, setting_value FROM survey_settings");
    const settings = {};
    rows.forEach(r => settings[r.setting_key] = r.setting_value);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

app.post("/api/admin/settings", async (req, res) => {
  try {
    const { key, value } = req.body;
    // Ensure empty strings are saved, not null
    const settingValue = value !== null && value !== undefined ? String(value) : "";
    await db.query(
      "INSERT INTO survey_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value=?",
      [key, settingValue, settingValue]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("Settings save error:", err);
    res.status(500).json({ error: "Failed to save setting" });
  }
});

app.post("/api/admin/log-activity", async (req, res) => {
  try {
    const { admin_email, admin_name, action, details } = req.body;
    if (!admin_email || !action) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const fullAction = details ? `${action} - ${details}` : action;
    await db.query(
      "INSERT INTO admin_logs (admin_email, admin_name, action) VALUES (?, ?, ?)",
      [admin_email, admin_name || "System", fullAction]
    );
    
    res.json({ ok: true });
  } catch (err) {
    console.error("Log activity error:", err);
    res.status(500).json({ error: "Failed to log activity" });
  }
});

// --- Survey Questions API ---
app.get("/api/admin/survey-questions", async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM survey_questions 
      ORDER BY 
        CASE section
          WHEN 'Personal Info' THEN 1
          WHEN 'Citizen\\'s Charter Awareness' THEN 2
          WHEN 'Service Satisfaction' THEN 3
          WHEN 'Feedback' THEN 4
          ELSE 5
        END,
        id`);
    const questions = rows.map(r => ({
      ...r,
      options: r.options ? JSON.parse(r.options) : [],
      rows: r.rows ? JSON.parse(r.rows) : [],
      columns: r.columns ? JSON.parse(r.columns) : []
    }));
    res.json(questions);
  } catch (err) {
    console.error("Fetch questions error:", err);
    res.status(500).json({ error: "Failed to fetch questions", details: err.message });
  }
});

app.post("/api/admin/survey-questions", async (req, res) => {
  try {
    const { field_name, section, question_text, field_type, is_required, options, rows, columns, instruction } = req.body;
    
    console.log("[v0] Received save request:", {
      field_name,
      section,
      question_text,
      field_type,
      is_required,
      optionsType: typeof options,
      rowsType: typeof rows,
      columnsType: typeof columns,
    });
    
    const optionsStr = typeof options === 'string' ? options : JSON.stringify(options || []);
    const rowsStr = typeof rows === 'string' ? rows : JSON.stringify(rows || []);
    const columnsStr = typeof columns === 'string' ? columns : JSON.stringify(columns || []);
    
    console.log("[v0] Saving to database with stringified values:", {
      field_name,
      section,
      optionsStrLength: optionsStr.length,
      rowsStrLength: rowsStr.length,
      columnsStrLength: columnsStr.length,
    });
    
    await db.query(
      `INSERT INTO survey_questions (field_name, section, question_text, field_type, is_required, options, \`rows\`, \`columns\`, instruction)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       section=?, question_text=?, field_type=?, is_required=?, options=?, \`rows\`=?, \`columns\`=?, instruction=?`,
      [
        field_name, section, question_text, field_type, is_required,
        optionsStr, rowsStr, columnsStr, instruction,
        section, question_text, field_type, is_required,
        optionsStr, rowsStr, columnsStr, instruction
      ]
    );
    
    console.log("[v0] Question saved successfully to database:", field_name);
    res.json({ ok: true, savedField: field_name });
  } catch (err) {
    console.error("[v0] Save question error:", err);
    res.status(500).json({ error: "Failed to save question", details: err.message });
  }
});

app.delete("/api/admin/survey-questions/:field_name", async (req, res) => {
  try {
    await db.query("DELETE FROM survey_questions WHERE field_name = ?", [req.params.field_name]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete question" });
  }
});

app.get("/api/survey-questions", async (req, res) => {
  try {
    // Order by section priority: Personal Info, Citizen's Charter Awareness, Service Satisfaction, Feedback
    const [rows] = await db.query(`SELECT * FROM survey_questions 
      ORDER BY 
        CASE section
          WHEN 'Personal Info' THEN 1
          WHEN 'Citizen\\'s Charter Awareness' THEN 2
          WHEN 'Service Satisfaction' THEN 3
          WHEN 'Feedback' THEN 4
          ELSE 5
        END,
        id`);
    const questions = rows.map(r => ({
      ...r,
      options: r.options ? JSON.parse(r.options) : [],
      rows: r.rows ? JSON.parse(r.rows) : [],
      columns: r.columns ? JSON.parse(r.columns) : []
    }));
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// --- Notifications API ---
app.get("/api/admin/notifications", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.post("/api/admin/notifications", async (req, res) => {
  try {
    const { notification_type, message, user_email, user_name } = req.body;
    await db.query(
      "INSERT INTO notifications (notification_type, message, user_email, user_name) VALUES (?, ?, ?, ?)",
      [notification_type, message, user_email || null, user_name || null]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// Create notification when survey is submitted
app.post("/api/survey/submit", async (req, res) => {
  const { user_email, user_name, responses } = req.body;
  try {
    // Calculate average satisfaction from SQD ratings
    let avgSatisfaction = 0;
    if (responses.sqdRatings) {
      const ratings = Object.values(responses.sqdRatings)
        .filter(r => r !== 'NA' && typeof r === 'number')
        .map(r => r);
      if (ratings.length > 0) {
        avgSatisfaction = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
      }
    }

    await db.query(
  `INSERT INTO survey_responses (
    user_email, user_name, client_type, gender, age, region, service,
    cc_awareness, cc_visibility, cc_helpfulness, sqd_ratings, suggestions, 
    feedback_email, average_satisfaction, response_data, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    user_email || null,
    user_name || null,
    responses.clientType || null,
    responses.gender || null,
    responses.age || null,
    responses.region || null,
    responses.service || null,
    responses.ccAwareness || null,
    responses.ccVisibility || null,
    responses.ccHelpfulness || null,
    JSON.stringify(responses.sqdRatings || {}),
    responses.suggestions || null,
    responses.email || null,
    avgSatisfaction,
    JSON.stringify(responses),
    "Completed" // or whatever status you want
  ]
);


    // Create notification
    await db.query(
      "INSERT INTO notifications (notification_type, message, user_email, user_name) VALUES (?, ?, ?, ?)",
      ["survey_submitted", `New survey submission from ${user_name || "Guest"}`, user_email, user_name || "Guest"]
    );

    // Store suggestions as help feedback so Support/Feedback admins can see them
    if (responses.suggestions && responses.suggestions.trim()) {
      await db.query(
        "INSERT INTO help_feedback (user_email, user_name, feedback_type, message) VALUES (?, ?, ?, ?)",
        [
          user_email || responses.email || null,
          user_name || responses.fullName || null,
          "survey_feedback",
          responses.suggestions.trim()
        ]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Submit error:", err);
    res.status(500).json({ error: "Failed to submit survey" });
  }
});

// --- Enhanced Analytics ---
app.get("/api/admin/analytics", async (req, res) => {
  try {
    const { serviceFilter, regionFilter, dateFilter } = req.query;
    let whereClause = "WHERE 1=1";
    const params = [];

    if (serviceFilter) {
      whereClause += " AND service = ?";
      params.push(serviceFilter);
    }
    if (regionFilter) {
      whereClause += " AND region = ?";
      params.push(regionFilter);
    }
    if (dateFilter) {
      whereClause += " AND DATE(submitted_at) = ?";
      params.push(dateFilter);
    }

    const [allResponses] = await db.query(`SELECT * FROM survey_responses ${whereClause}`, params);
    const [total] = await db.query(`SELECT COUNT(*) as count FROM survey_responses ${whereClause}`, params);
    const [avgSat] = await db.query(`SELECT AVG(average_satisfaction) as avg FROM survey_responses ${whereClause}`, params);

    // Calculate distributions
    const byRegion = {};
    const byGender = {};
    const byClientType = {};
    const sqdDistribution = {};

    allResponses.forEach(r => {
      if (r.region) byRegion[r.region] = (byRegion[r.region] || 0) + 1;
      if (r.gender) byGender[r.gender] = (byGender[r.gender] || 0) + 1;
      if (r.client_type) byClientType[r.client_type] = (byClientType[r.client_type] || 0) + 1;

      try {
        const sqdRatings = typeof r.sqd_ratings === "string" ? JSON.parse(r.sqd_ratings) : r.sqd_ratings || {};
        Object.entries(sqdRatings).forEach(([key, val]) => {
          if (val !== "NA" && typeof val === "number") {
            sqdDistribution[key] = (sqdDistribution[key] || 0) + 1;
          }
        });
      } catch (e) {}
    });

    res.json({
      totalResponses: total[0].count,
      averageSatisfaction: avgSat[0].avg || 0,
      byRegion: Object.entries(byRegion).map(([region, count]) => ({ region, count })),
      byGender: Object.entries(byGender).map(([gender, count]) => ({ gender, count })),
      byClientType: Object.entries(byClientType).map(([client_type, count]) => ({ client_type, count })),
      sqdDistribution: Object.entries(sqdDistribution).map(([name, count]) => ({ name, count }))
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

async function logAdminAction(email, name, action, details = null) {
  try {
    const fullAction = details ? `${action} - ${details}` : action;
    await db.query(
      "INSERT INTO admin_logs (admin_email, admin_name, action) VALUES (?, ?, ?)",
      [email, name || "System", fullAction]
    );
  } catch (err) {
    console.error("Error logging admin action:", err);
  }
}

app.listen(4000, () => console.log("Backend API running on http://localhost:4000"));
