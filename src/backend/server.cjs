require("dotenv").config({ path: ".env" });
const pool = require("./db.cjs"); // re-use single Pool instance

// Load environment variables
require("dotenv").config({ path: ".env" }); // loads env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");

const codeSendCooldown = new Map(); // Tracks last code send time per email
const CODE_COOLDOWN_MS = 30 * 1000; // 30 seconds cooldown

const app = express();
// CONFIGURED CORS TO ALLOW CREDENTIALS WITH SPECIFIC ORIGIN
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow localhost origins for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    // Allow production origin if set
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    // Default allow for development
    callback(null, true);
  },
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "60929193374-3paeve0ig0pqcenie8gdsh6k1b53hj91.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);


// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // EMAIL_USER in Render env
    pass: process.env.EMAIL_PASS, // EMAIL_PASS (app password)
  },
  tls: {
    rejectUnauthorized: true,
  },
  connectionTimeout: 10000, // 10 seconds
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
    await pool.query(`CREATE TABLE IF NOT EXISTS survey_questions (
      id SERIAL PRIMARY KEY,
      field_name VARCHAR(100) UNIQUE NOT NULL,
      section VARCHAR(100),
      question_text TEXT NOT NULL,
      field_type VARCHAR(50),
      is_required BOOLEAN DEFAULT TRUE,
      options TEXT,
      rows TEXT,
      columns TEXT,
      instruction TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);


    // Create survey_responses table (replaces submissions)
    await pool.query(`CREATE TABLE IF NOT EXISTS survey_responses (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255),
      user_name VARCHAR(100),
      client_type VARCHAR(50),
      gender VARCHAR(50),
      age INTEGER,
      region VARCHAR(100),
      service VARCHAR(255),
      cc_awareness INTEGER,
      cc_visibility INTEGER,
      cc_helpfulness INTEGER,
      sqd_ratings TEXT,
      suggestions TEXT,
      feedback_email VARCHAR(255),
      average_satisfaction NUMERIC(5,2),
      response_data TEXT,
      status VARCHAR(32) DEFAULT 'Completed',
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_email ON survey_responses(user_email)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_region ON survey_responses(region)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_submitted_at ON survey_responses(submitted_at)`);


    await pool.query(`CREATE TABLE IF NOT EXISTS admin_logs (
      id SERIAL PRIMARY KEY,
      admin_email VARCHAR(255),
      admin_name VARCHAR(100),
      action TEXT,
      log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_log_time ON admin_logs(log_time)`);

    await pool.query(`CREATE TABLE IF NOT EXISTS help_feedback (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255),
      user_name VARCHAR(100),
      feedback_type VARCHAR(50),
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'New',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS faqs (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category VARCHAR(100),
      is_published BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS survey_settings (
      id SERIAL PRIMARY KEY,
      setting_key VARCHAR(100) UNIQUE,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      notification_type VARCHAR(50),
      message TEXT,
      user_email VARCHAR(255),
      user_name VARCHAR(100),
      is_read BOOLEAN DEFAULT FALSE,
      is_deleted BOOLEAN DEFAULT FALSE, 
      deleted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)`);

    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      "fullName" VARCHAR(100),
      district VARCHAR(50),
      barangay VARCHAR(50),
      "isAdmin" BOOLEAN DEFAULT FALSE,
      role VARCHAR(100),
      reset_code VARCHAR(10),
      reset_code_expiry BIGINT,
      email_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

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

    // Insert hardcoded admins if they don't exist
    for (const admin of admins) {
      const { rows: existingAdmin } = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [admin.email]
      );
      if (existingAdmin.length === 0) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        await pool.query(
          `INSERT INTO users (email, password, "fullName", role, "isAdmin", email_verified) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [admin.email, hashedPassword, admin.fullName, admin.role, true, true]
        );
        console.log(`[DB] Created admin account: ${admin.email}`);
      }
    }

    console.log("[DB] Admin accounts initialized");

    console.log("Database tables initialized successfully");
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}

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
    // Use PostgreSQL query/results!
    const { rows } = await pool.query(
      `SELECT id, password, role, "isAdmin", "fullName", email_verified FROM users WHERE email = $1`,
      [u.email]
    );
    if (!rows.length) {
      // Create new user with hashed password
      const hash = await bcrypt.hash(u.password, 10);
      const emailVerified = u.role === "user" ? false : true;
      await pool.query(
        `INSERT INTO users (email, password, "fullName", "isAdmin", role, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [u.email, hash, u.fullName, u.isAdmin, u.role, emailVerified]
      );
      console.log("Seeded new user:", u.email, u.role, "Verified:", emailVerified);
    } else {
      const existingUser = rows[0];

      let needsUpdate = false;
      let updateFields = [];
      let updateValues = [];

      // Password rehash/update logic
      const isPasswordHashed = existingUser.password && existingUser.password.startsWith('$2');
      if (!isPasswordHashed) {
        const hash = await bcrypt.hash(u.password, 10);
        updateFields.push(`password = $${updateFields.length + 1}`);
        updateValues.push(hash);
        needsUpdate = true;
      } else {
        try {
          const match = await bcrypt.compare(u.password, existingUser.password);
          if (!match) {
            const hash = await bcrypt.hash(u.password, 10);
            updateFields.push(`password = $${updateFields.length + 1}`);
            updateValues.push(hash);
            needsUpdate = true;
          }
        } catch (err) {
          const hash = await bcrypt.hash(u.password, 10);
          updateFields.push(`password = $${updateFields.length + 1}`);
          updateValues.push(hash);
          needsUpdate = true;
        }
      }

      // isAdmin
      if (u.isAdmin) {
        const currentIsAdmin = existingUser.isAdmin === true;
        if (currentIsAdmin !== u.isAdmin) {
          updateFields.push(`"isAdmin" = $${updateFields.length + 1}`);
          updateValues.push(u.isAdmin);
          needsUpdate = true;
        }
        if (!existingUser.role || existingUser.role !== u.role) {
          updateFields.push(`role = $${updateFields.length + 1}`);
          updateValues.push(u.role);
          needsUpdate = true;
        }
      }

      // fullName
      if (u.fullName && existingUser.fullName !== u.fullName) {
        updateFields.push(`"fullName" = $${updateFields.length + 1}`);
        updateValues.push(u.fullName);
        needsUpdate = true;
      }

      // email_verified
      const desiredVerifiedStatus = u.role === "user" ? false : true;
      if (existingUser.email_verified !== desiredVerifiedStatus) {
        updateFields.push(`email_verified = $${updateFields.length + 1}`);
        updateValues.push(desiredVerifiedStatus);
        needsUpdate = true;
        console.log(`User ${u.email} verification status updated to ${desiredVerifiedStatus}`);
      }

      if (needsUpdate) {
        updateValues.push(u.email);
        await pool.query(
          `UPDATE users SET ${updateFields.join(", ")} WHERE email = $${updateValues.length}`,
          updateValues
        );
        console.log("Updated user:", u.email, "Fields:", updateFields.join(", "));
      }
    }
  }
}

app.post("/api/auth/admin/create-account", async (req, res) => {
  try {
    const { fullName, email, password, role, createdBy, createdByRole } = req.body;
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    
    const { rows: existingUsers } = await pool.query(
      "SELECT id, \"isAdmin\", email_verified FROM users WHERE email = $1", 
      [email]
    );
    
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      
      // If account is already activated (isAdmin = true OR email_verified = true), block creation
      if (existingUser.isAdmin === true || existingUser.email_verified === true) {
        return res.status(409).json({ 
          success: false, 
          message: "Email already registered with an active account" 
        });
      }
      
      // If account exists but was never activated (still pending or failed), delete it to allow re-creation
      console.log(`♻️  Removing non-activated account for ${email} to allow re-creation`);
      await pool.query("DELETE FROM users WHERE email = $1 AND \"isAdmin\" = FALSE AND email_verified = FALSE", [email]);
    }
    
    const hash = await bcrypt.hash(password, 10);
    
    const requiresApproval = createdByRole && createdByRole.toLowerCase() !== "superadmin";
    const emailVerified = !requiresApproval; // Auto-verify if superadmin creates, else requires approval
    const isAdminActive = !requiresApproval; // Only activate if superadmin creates
    
    await pool.query(
      `INSERT INTO users (email, password, "fullName", role, "isAdmin", email_verified) VALUES ($1, $2, $3, $4, $5, $6)`,
      [email, hash, fullName, role, isAdminActive, emailVerified]
    );
    
    if (requiresApproval) {
      await logAdminAction(
        createdBy || "admin", 
        createdBy || "Admin", 
        `Created new admin account for ${fullName} (${email}) with role: ${role} - Pending superadmin approval`
      );
      
      res.status(200).json({ 
        success: true, 
        message: "Admin account created successfully. Waiting for superadmin approval.",
        requiresApproval: true 
      });
    } else {
      await logAdminAction(
        createdBy || "admin", 
        createdBy || "Admin", 
        `Created new admin account for ${fullName} (${email}) with role: ${role}`
      );
      
      res.status(200).json({ 
        success: true, 
        message: "Admin account created and activated successfully",
        requiresApproval: false 
      });
    }
  } catch (err) {
    console.error("❌ Admin create error:", err);
    res.status(500).json({ success: false, message: "Failed to create admin account" });
  }
});

app.post("/api/auth/send-verification-code", async (req, res) => {
  try {
    const { email, code, fullName } = req.body;
    
    const lastSent = codeSendCooldown.get(email);
    if (lastSent && (Date.now() - lastSent) < CODE_COOLDOWN_MS) {
      const remainingTime = Math.ceil((CODE_COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
      return res.status(429).json({ 
        error: `Please wait ${remainingTime} seconds before requesting another code.` 
      });
    }

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    console.log(`\n👨‍💼 Admin verification code request for: ${email}`);

    const { rows: existingAdmins } = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND \"isAdmin\" = TRUE", 
      [email]
    );
    
    if (existingAdmins.length) {
      return res.status(400).json({ 
        error: "Email already exists in admin accounts" 
      });
    }

    // Try to send email
    let emailSent = false;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Admin Account Verification Code - Customer Satisfaction Survey",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Admin Account Registration</h2>
            <p>Hi ${fullName},</p>
            <p>Thank you for being invited to join as an admin. Here is your email verification code:</p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
              <h1 style="color: white; letter-spacing: 10px; font-size: 42px; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${code}</h1>
            </div>
            <p style="color: #dc2626; font-weight: bold;">⏰ This code expires in 30 seconds.</p>
            <p style="color: #6b7280; font-size: 14px;">If you did not expect this invitation, please ignore this email.</p>
          </div>
        `
      });
      console.log("✅ Admin verification email sent to:", email);
      emailSent = true;
    } catch (emailErr) {
      console.error("❌ Email sending failed:", emailErr.message);
      emailSent = false;
    }

    // Always return the code for popup display
    res.status(200).json({ 
      ok: true, 
      code: code,
      emailSent: emailSent,
      message: emailSent 
        ? "Verification code sent to email" 
        : "Verification code generated (email unavailable, but code is valid)"
    });
  } catch (err) {
    console.error("❌ Send verification error:", err);
    res.status(400).json({ 
      error: "Failed to send verification code" 
    });
  }
});

app.get("/api/submissions/:email", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, user_name, region, client_type, gender, age, service,
              average_satisfaction, status, submitted_at, response_data
       FROM survey_responses
       WHERE user_email = $1
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
    const { rows } = await pool.query(
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
    const { rows } = await pool.query(
      "SELECT * FROM survey_responses WHERE id = $1",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    const row = rows[0];
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
    const { rows } = await pool.query(
      "SELECT user_email, user_name FROM survey_responses WHERE id = $1",
      [req.params.id]
    );
    if (!rows.length || rows[0].user_email !== user_email) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const row = rows[0];
    let avgSatisfaction = 0;
    if (responses.sqdRatings) {
      const ratings = Object.values(responses.sqdRatings)
        .filter(r => r !== 'N/A' && typeof r === 'number')
        .map(r => r);
      if (ratings.length > 0) {
        avgSatisfaction = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
      }
    }

    await pool.query(
      `UPDATE survey_responses SET
        client_type = $1,
        gender = $2,
        age = $3,
        region = $4,
        service = $5,
        cc_awareness = $6,
        cc_visibility = $7,
        cc_helpfulness = $8,
        sqd_ratings = $9,
        suggestions = $10,
        feedback_email = $11,
        average_satisfaction = $12,
        response_data = $13,
        updated_at = NOW()
       WHERE id = $14`,
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

    await pool.query(
      "INSERT INTO notifications (notification_type, message, user_email, user_name) VALUES ($1, $2, $3, $4)",
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
    const { rows } = await pool.query(
      "SELECT user_email, user_name FROM survey_responses WHERE id = $1",
      [req.params.id]
    );
    if (!rows.length || rows[0].user_email !== user_email) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const row = rows[0];
    await pool.query(
      "INSERT INTO notifications (notification_type, message, user_email, user_name) VALUES ($1, $2, $3, $4)",
      ["survey_deleted", `Survey submission deleted by ${row.user_name || "User"}`, user_email, row.user_name || "User"]
    );

    await pool.query("DELETE FROM survey_responses WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete submission" });
  }
});

app.get("/api/admin/analytics", async (req, res) => {
  try {
    const { serviceFilter, regionFilter, dateFilter } = req.query;
    let whereClause = "WHERE 1=1";
    let paramIndex = 1;
    const params = [];

    if (serviceFilter) {
      whereClause += ` AND service = $${paramIndex++}`;
      params.push(serviceFilter);
    }
    if (regionFilter) {
      whereClause += ` AND region = $${paramIndex++}`;
      params.push(regionFilter);
    }
    if (dateFilter) {
      whereClause += ` AND DATE(submitted_at AT TIME ZONE 'UTC') = $${paramIndex++}`;
      params.push(dateFilter);
    }

    const { rows: allResponses } = await pool.query(`SELECT * FROM survey_responses ${whereClause}`, params);
    const { rows: totalRows } = await pool.query(`SELECT COUNT(*) as count FROM survey_responses ${whereClause}`, params);
    const { rows: avgRows } = await pool.query(`SELECT AVG(average_satisfaction) as avg FROM survey_responses ${whereClause}`, params);

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
      totalResponses: totalRows[0].count,
      averageSatisfaction: avgRows[0].avg || 0,
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
    const { rows } = await pool.query(
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
    const { rows } = await pool.query(
      "SELECT id, admin_email, admin_name, action, log_time FROM admin_logs WHERE admin_email = $1 ORDER BY log_time DESC LIMIT 50",
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
    console.log(`\n📝 Registration attempt for: ${email}`);
    
    const lastSent = codeSendCooldown.get(email);
    if (lastSent && (Date.now() - lastSent) < CODE_COOLDOWN_MS) {
      const remainingTime = Math.ceil((CODE_COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
      return res.status(429).json({ 
        error: `Please wait ${remainingTime} seconds before requesting another code.` 
      });
    }
    
    // Check if email already exists
    const { rows: existingUsers } = await pool.query(
      "SELECT id, email_verified FROM users WHERE email = $1", 
      [email]
    );
    
    if (existingUsers.length > 0) {
      if (existingUsers[0].email_verified) {
        return res.status(409).json({ 
          error: "Email already registered. Please log in." 
        });
      } else {
        console.log("♻️  User exists but not verified, resending code...");
        const verificationCode = randomCode(6);
        const codeExpiry = Date.now() + 30 * 1000;
        
        await pool.query(
          "UPDATE users SET reset_code = $1, reset_code_expiry = $2 WHERE email = $3",
          [verificationCode, codeExpiry, email]
        );
        
        codeSendCooldown.set(email, Date.now());

        return res.status(200).json({ 
          ok: true, 
          code: verificationCode,
          message: "Code generated. Choose to send email or proceed."
        });
      }
    }

    // Create new user
    const hash = await bcrypt.hash(password, 10);
    const verificationCode = randomCode(6);
    const codeExpiry = Date.now() + 30 * 1000;

    await pool.query(
      `INSERT INTO users (email, password, "fullName", district, barangay, role, reset_code, reset_code_expiry, email_verified) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [email, hash, fullName, district, barangay, "user", verificationCode, codeExpiry, false]
    );

    console.log("✅ User created in database");
    console.log("🔑 Verification code:", verificationCode);
    
    codeSendCooldown.set(email, Date.now());

    res.status(200).json({ 
      ok: true, 
      code: verificationCode,
      message: "Registration successful! Choose to send code to email or proceed with the code shown."
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(400).json({ 
      error: "Registration failed. Please try again." 
    });
  }
});

app.post("/api/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;
    const { rows } = await pool.query(
      "SELECT reset_code, reset_code_expiry, email_verified FROM users WHERE email = $1", [email]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];
    if (user.reset_code === code && Date.now() < Number(user.reset_code_expiry)) {
      await pool.query(
        "UPDATE users SET reset_code = NULL, reset_code_expiry = NULL, email_verified = TRUE WHERE email = $1", [email]
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

    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (!rows.length) {
      console.log("Login failed: User not found for email:", email);
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    const user = rows[0];
    if (!user.email_verified) {
      return res.status(403).json({ error: "Please verify your email first. Check your inbox for the verification code." });
    }

    // Check if password is hashed (starts with $2)
    const isPasswordHashed = user.password && user.password.startsWith('$2');
    if (!isPasswordHashed) {
      console.log("Login failed: Password not hashed for user:", email);
      // If password is not hashed, hash it now and update the user
      const hash = await bcrypt.hash(password, 10);
      await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hash, email]);
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

    const { rows: existingUserRows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const existingUser = existingUserRows.length ? existingUserRows[0] : null;
    let userRecord = existingUser;

    if (!existingUser) {
      const placeholderPassword = await bcrypt.hash(payload?.sub || email, 10);
      const { rows: insertedRows } = await pool.query(
        'INSERT INTO users (email, password, "fullName", "isAdmin", role, email_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, password, "fullName", "isAdmin", role, email_verified, district, barangay',
        [email, placeholderPassword, fullName || email, false, "user", true]
      );
      userRecord = insertedRows[0];
    } else if (fullName && !existingUser.fullName) {
      await pool.query('UPDATE users SET "fullName" = $1, email_verified = TRUE WHERE email = $2', [fullName, email]);
      userRecord = { ...existingUser, fullName, email_verified: true };
    } else if (existingUser && !existingUser.email_verified) {
      await pool.query("UPDATE users SET email_verified = TRUE WHERE email = $1", [email]);
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
    await pool.query(
      "UPDATE users SET \"fullName\"=$1, district=$2, barangay=$3 WHERE email=$4",
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
    
    console.log(`\n🔐 Password reset request for: ${email}`);
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const lastSent = codeSendCooldown.get(email);
    if (lastSent && (Date.now() - lastSent) < CODE_COOLDOWN_MS) {
      const remainingTime = Math.ceil((CODE_COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
      return res.status(429).json({ 
        error: `Please wait ${remainingTime} seconds before requesting another code.` 
      });
    }

    let userExists = false;
    let fullName = "User";
    
    try {
      const { rows } = await pool.query(
        'SELECT id, "fullName", email_verified FROM users WHERE email = $1', 
        [email]
      );
      
      if (rows.length === 0) {
        // Account doesn't exist
        console.log("❌ Account not found for email:", email);
        return res.status(404).json({ 
          error: "Account not found. Please check your email or sign up for a new account." 
        });
      }
      
      const user = rows[0];
      if (!user.email_verified) {
        console.log("❌ Account not verified for email:", email);
        return res.status(404).json({ 
          error: "Account not found. Please check your email or sign up for a new account." 
        });
      }
      
      userExists = true;
      fullName = user.fullName || "User";
      
    } catch (dbErr) {
      console.error("⚠️ Database error:", dbErr.message);
      return res.status(500).json({ 
        error: "Unable to process request. Please try again later." 
      });
    }

    const pinCode = randomCode(6);
    const expiresAt = Date.now() + 30 * 1000;

    // Update database with reset code
    await pool.query(
      "UPDATE users SET reset_code = $1, reset_code_expiry = $2 WHERE email = $3",
      [pinCode, expiresAt, email]
    );

    console.log("🔑 Password reset code:", pinCode);
    
    codeSendCooldown.set(email, Date.now());

    // Try to send email
    let emailSent = false;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Code - Customer Satisfaction Survey",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">🔐 Password Reset Request</h2>
            <p>Hi ${fullName},</p>
            <p>We received a request to reset your password. Here is your reset code:</p>
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
              <h1 style="color: white; letter-spacing: 12px; font-size: 42px; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${pinCode}</h1>
            </div>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #dc2626; margin: 0; font-weight: bold;">⏰ This code expires in 30 seconds</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        `
      });
      console.log("✅ Password reset email sent to:", email);
      emailSent = true;
    } catch (emailErr) {
      console.error("❌ Email sending failed:", emailErr.message);
      emailSent = false;
    }
    
    res.status(200).json({ 
      ok: true, 
      code: pinCode,
      emailSent: emailSent,
      message: emailSent 
        ? "Password reset code sent! Check your email." 
        : "Password reset code generated. Use the code shown in the popup."
    });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ 
      error: "Unable to process password reset request. Please try again later."
    });
  }
});

// --- Verify Reset Code ---
app.post("/api/verify-reset-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    const { rows } = await pool.query(
      "SELECT reset_code, reset_code_expiry FROM users WHERE email = $1", [email]
    );
    if (
      rows.length &&
      rows[0].reset_code === code &&
      Date.now() < Number(rows[0].reset_code_expiry)
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
    const { rows } = await pool.query(
      "SELECT reset_code, reset_code_expiry FROM users WHERE email = $1", [email]
    );
    if (
      rows.length &&
      rows[0].reset_code === code &&
      Date.now() < Number(rows[0].reset_code_expiry)
    ) {
      const pwdCheck = validatePassword(newPassword);
      if (pwdCheck !== "strong") return res.status(400).json({ error: pwdCheck });
      const hash = await bcrypt.hash(newPassword, 10);
      await pool.query(
        "UPDATE users SET password = $1, reset_code = NULL, reset_code_expiry = NULL WHERE email = $2",
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
  const { rows: targetUserRows } = await pool.query("SELECT \"fullName\", role, email_verified FROM users WHERE email = $1", [targetEmail]);
  if (!targetUserRows.length) {
    return res.status(404).json({ error: "User not found" });
  }

  const targetUser = targetUserRows[0];
  const oldRole = targetUser.role || "none";

  // Prevent changing role of unverified users if necessary (optional, depending on requirements)
  if (!targetUser.email_verified && requesterRoleLower === "superadmin") {
    // Example: Superadmin can still change role, but other admins might not be able to.
    // Add specific logic here if needed.
  }

  // Update the role in the database
  await pool.query("UPDATE users SET role = $1 WHERE email = $2", [newRole, targetEmail]);

  // Get requester's name for logging
  const { rows: requesterRows } = await pool.query("SELECT \"fullName\" FROM users WHERE email = $1", [requesterEmail]);
  await logAdminAction(requesterEmail, requesterRows.length ? requesterRows[0].fullName : "System", `Updated role for ${targetUser.fullName || targetEmail} (${targetEmail}) from "${oldRole}" to "${newRole}"`);

  res.json({ ok: true, message: `Role updated from ${oldRole} to ${newRole}` });
});

app.get("/api/admin/users", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT email, \"fullName\", role, \"isAdmin\", email_verified FROM users WHERE \"isAdmin\" = TRUE ORDER BY email"
    );
    res.json(rows);
  } catch (err) {
    console.error("[v0] Admin users API error:", err);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

app.get("/api/admin/list", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT email, \"fullName\", role, \"isAdmin\", DATE(created_at) as created_at, email_verified FROM users WHERE \"isAdmin\" = TRUE"
    );
    res.json(rows);
  } catch (err) {
    console.error("[v0] Admin list API error:", err);
    res.status(500).json({ error: "Failed to fetch admin list" });
  }
});

app.get("/api/admin/stats", async (req, res) => {
  try {
    const { rows: statsRows } = await pool.query(
      `SELECT 
        COUNT(*) as total_responses,
        COALESCE(AVG(CAST(average_satisfaction AS DECIMAL)), 0) as avg_satisfaction,
        COUNT(DISTINCT user_email) as total_respondents
       FROM survey_responses`
    );
    const stats = statsRows[0] || {};

    const { rows: adminRows } = await pool.query(
      `SELECT COUNT(*) as count FROM users WHERE "isAdmin" = true`
    );
    const adminCount = adminRows[0]?.count || 0;

    res.json({
      totalResponses: parseInt(stats.total_responses) || 0,
      avgSatisfaction: parseFloat(stats.avg_satisfaction) || 0,
      totalRespondents: parseInt(stats.total_respondents) || 0,
      activeAdmins: adminCount
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get("/api/faqs", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM faqs WHERE is_published = TRUE ORDER BY category");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

app.get("/api/admin/faqs", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM faqs ORDER BY category");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

app.post("/api/admin/faqs", async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    await pool.query(
      "INSERT INTO faqs (question, answer, category) VALUES ($1, $2, $3)",
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
    await pool.query(
      "UPDATE faqs SET question=$1, answer=$2, category=$3, is_published=$4 WHERE id=$5",
      [question, answer, category, is_published, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update FAQ" });
  }
});

app.delete("/api/admin/faqs/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM faqs WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
});

app.post("/api/help-feedback", async (req, res) => {
  try {
    const { user_email, user_name, feedback_type, message } = req.body;
    await pool.query(
      "INSERT INTO help_feedback (user_email, user_name, feedback_type, message) VALUES ($1, $2, $3, $4)",
      [user_email || null, user_name || null, feedback_type, message]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

app.get("/api/admin/help-feedback", async (req, res) => {
  try {
    const { rows } = await pool.query(
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
    await pool.query(
      "UPDATE help_feedback SET status = $1, updated_at = NOW() WHERE id = $2",
      [status, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update feedback" });
  }
});

app.get("/api/settings", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT setting_key, setting_value FROM survey_settings");
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
    await pool.query(
      "INSERT INTO survey_settings (setting_key, setting_value) VALUES ($1, $2) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2",
      [key, settingValue]
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
    await pool.query(
      "INSERT INTO admin_logs (admin_email, admin_name, action) VALUES ($1, $2, $3)",
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
    const { rows } = await pool.query(`SELECT * FROM survey_questions
      ORDER BY
        CASE section
          WHEN 'Personal Info' THEN 1
          WHEN 'Citizen''s Charter Awareness' THEN 2
          WHEN 'Service Satisfaction' THEN 3
          WHEN 'Feedback' THEN 4
          ELSE 5
        END,
        section,
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

    // Only force false for new Feedback questions during initial seeding, not on updates
    let finalIsRequired = is_required;
    if (section === 'Feedback' && !is_required) { // If is_required is explicitly false or not provided (and thus defaults to true for boolean types)
      finalIsRequired = false;
    }


    console.log("[v0] Saving to database with stringified values:", {
      field_name,
      section,
      finalIsRequired,
      optionsStrLength: optionsStr.length,
      rowsStrLength: rowsStr.length,
      columnsStrLength: columnsStr.length,
    });

    await pool.query(
      `INSERT INTO survey_questions
    (field_name, section, question_text, field_type, is_required, options, rows, columns, instruction)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (field_name)
     DO UPDATE SET section = $2, question_text = $3, field_type = $4, is_required = $5, options = $6, rows = $7, columns = $8,
     instruction = $9`,
      [
        field_name, section, question_text, field_type, finalIsRequired,
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
    await pool.query("DELETE FROM survey_questions WHERE field_name = $1", [req.params.field_name]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete question" });
  }
});

app.get("/api/survey-questions", async (req, res) => {
  try {
    const { rows } = await pool.query(
  `SELECT id, section, field_name, field_type, question_text, is_required, 
          options, rows, columns, instruction 
   FROM survey_questions ORDER BY id`
);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching survey questions:", err);
    res.status(500).json({ error: "Failed to fetch survey questions" });
  }
});

// --- Notifications API ---
app.get("/api/admin/notifications", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Only fetch non-deleted notifications
    const { rows } = await pool.query(
      `SELECT * FROM notifications 
       WHERE is_deleted = FALSE 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM notifications WHERE is_deleted = FALSE`
    );

    res.json({
      data: rows,
      total: parseInt(countResult.rows[0].total, 10),
    });
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications", details: err.message });
  }
});

app.post("/api/admin/notifications", async (req, res) => {
  try {
    const { notification_type, message, user_email, user_name } = req.body;
    await pool.query(
      "INSERT INTO notifications (notification_type, message, user_email, user_name) VALUES ($1, $2, $3, $4)",
      [notification_type, message, user_email || null, user_name || null]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// ADDED DELETE endpoint for notifications
app.delete("/api/admin/notifications/:id", async (req, res) => {
  try {
    const { softDelete } = req.body || {};
    
    if (softDelete) {
      await pool.query(
        "UPDATE notifications SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE id = $1",
        [req.params.id]
      );
    } else {
      // Hard delete if needed
      await pool.query("DELETE FROM notifications WHERE id = $1", [req.params.id]);
    }
    
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

// ADDED DELETE endpoint to delete all notifications (soft delete only)
app.delete("/api/admin/notifications", async (req, res) => {
  try {
    // Soft delete all notifications by marking them as deleted
    await pool.query(
      "UPDATE notifications SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE is_deleted = false"
    );
    
    res.json({ ok: true, message: "All notifications dismissed" });
  } catch (err) {
    console.error("Delete all notifications error:", err);
    res.status(500).json({ error: "Failed to delete all notifications" });
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
        .filter(r => r !== 'N/A' && typeof r === 'number')
        .map(r => r);
      if (ratings.length > 0) {
        avgSatisfaction = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
      }
    }

    await pool.query(
      `INSERT INTO survey_responses (
        user_email, user_name, client_type, gender, age, region, service,
        cc_awareness, cc_visibility, cc_helpfulness, sqd_ratings, suggestions,
        feedback_email, average_satisfaction, response_data, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
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
    await pool.query(
      "INSERT INTO notifications (notification_type, message, user_email, user_name) VALUES ($1, $2, $3, $4)",
      ["survey_submitted", `New survey submission from ${user_name || "Guest"}`, user_email, user_name || "Guest"]
    );

    // Store suggestions as help feedback so Support/Feedback admins can see them
    if (responses.suggestions && responses.suggestions.trim()) {
      await pool.query(
        "INSERT INTO help_feedback (user_email, user_name, feedback_type, message) VALUES ($1, $2, $3, $4)",
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
    let paramIndex = 1;
    const params = [];

    if (serviceFilter) {
      whereClause += ` AND service = $${paramIndex++}`;
      params.push(serviceFilter);
    }
    if (regionFilter) {
      whereClause += ` AND region = $${paramIndex++}`;
      params.push(regionFilter);
    }
    if (dateFilter) {
      whereClause += ` AND DATE(submitted_at AT TIME ZONE 'UTC') = $${paramIndex++}`;
      params.push(dateFilter);
    }

    const { rows: allResponses } = await pool.query(`SELECT * FROM survey_responses ${whereClause}`, params);
    const { rows: totalRows } = await pool.query(`SELECT COUNT(*) as count FROM survey_responses ${whereClause}`, params);
    const { rows: avgRows } = await pool.query(`SELECT AVG(average_satisfaction) as avg FROM survey_responses ${whereClause}`, params);

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
      totalResponses: totalRows[0].count,
      averageSatisfaction: avgRows[0].avg || 0,
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
    await pool.query(
      "INSERT INTO admin_logs (admin_email, admin_name, action) VALUES ($1, $2, $3)",
      [email, name || "System", fullAction]
    );
  } catch (err) {
    console.error("Error logging admin action:", err);
  }
}

app.post("/api/admin/delete-account", async (req, res) => {
  try {
    const { requesterEmail, requesterRole, targetEmail } = req.body;

    // Only superadmin can delete admin accounts
    if (!requesterRole || requesterRole.toLowerCase() !== "superadmin") {
      return res.status(403).json({ error: "Only superadmins can delete admin accounts" });
    }

    // Prevent self-deletion
    if (requesterEmail === targetEmail) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }

    // Check if target admin exists
    const { rows: adminRows } = await pool.query("SELECT id, \"fullName\", email FROM users WHERE email = $1 AND \"isAdmin\" = TRUE", [targetEmail]);
    if (!adminRows.length) {
      return res.status(404).json({ error: "Admin account not found" });
    }

    // Delete the admin account
    await pool.query("DELETE FROM users WHERE email = $1", [targetEmail]);

    // Log the action
    await logAdminAction(requesterEmail, "System", "DELETE_ADMIN", `Deleted admin account: ${targetEmail}`);

    res.status(200).json({ ok: true, message: "Admin account deleted successfully" });
  } catch (err) {
    console.error("Delete admin error:", err);
    res.status(400).json({ error: "Failed to delete admin account" });
  }
});

app.post("/api/auth/delete-account", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    console.log("[v0] Starting delete account for email:", email);

    const userResult = await pool.query(
      'SELECT "fullName", "isAdmin" FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rowCount === 0) {
      console.log("[v0] User not found:", email);
      return res.status(404).json({ error: "User not found" });
    }

    const userName = userResult.rows[0].fullName || "User";
    const isAdmin = userResult.rows[0].isAdmin;

    // Delete survey responses associated with the user
    await pool.query("DELETE FROM survey_responses WHERE user_email = $1", [email]);
    console.log("[v0] Deleted survey responses for:", email);

    // Delete help feedback associated with the user
    await pool.query("DELETE FROM help_feedback WHERE user_email = $1", [email]);
    console.log("[v0] Deleted help feedback for:", email);

    // Delete the user account from database
    const deleteResult = await pool.query("DELETE FROM users WHERE email = $1", [email]);

    const accountType = isAdmin ? "Admin" : "User";
    await pool.query(
      "INSERT INTO notifications (notification_type, message, user_email, user_name) VALUES ($1, $2, $3, $4)",
      ["account_deleted", `${accountType} account deleted: ${userName} (${email})`, email, userName]
    );

    console.log("[v0] Account successfully deleted for:", email);
    res.status(200).json({ ok: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("[v0] Delete account error:", err);
    res.status(400).json({ error: "Failed to delete account: " + err.message });
  }
});

app.post("/api/send-reset-email", async (req, res) => {
  try {
    const { email, code } = req.body;
    
    let fullName = "User";
    try {
      const { rows } = await pool.query(
        'SELECT "fullName" FROM users WHERE email = $1', 
        [email]
      );
      if (rows.length > 0) {
        fullName = rows[0].fullName || "User";
      }
    } catch (err) {
      console.error("DB error getting user:", err.message);
    }

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Code - Customer Satisfaction Survey",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">🔐 Password Reset Request</h2>
            <p>Hi ${fullName},</p>
            <p>We received a request to reset your password. Here is your reset code:</p>
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
              <h1 style="color: white; letter-spacing: 12px; font-size: 42px; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${code}</h1>
            </div>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="color: #dc2626; margin: 0; font-weight: bold;">⏰ This code expires in 30 seconds</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        `
      });
      console.log("✅ Password reset email sent to:", email);
      res.status(200).json({ ok: true, message: "Email sent successfully" });
    } catch (emailErr) {
      console.error("❌ Email sending failed:", emailErr.message);
      res.status(200).json({ ok: true, message: "Email unavailable, code already shown" });
    }
  } catch (err) {
    console.error("Send reset email error:", err);
    res.status(200).json({ ok: true, message: "Email unavailable, code already shown" });
  }
});

app.post("/api/send-verification-email", async (req, res) => {
  try {
    const { email, code } = req.body;
    
    let fullName = "User";
    try {
      const { rows } = await pool.query(
        'SELECT "fullName" FROM users WHERE email = $1', 
        [email]
      );
      if (rows.length > 0) {
        fullName = rows[0].fullName || "User";
      }
    } catch (err) {
      console.error("DB error getting user:", err.message);
    }

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your Email - Customer Satisfaction Survey",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(to bottom, #f8fafc, #ffffff);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">Welcome to Customer Satisfaction Survey! 🎉</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1e293b; margin-top: 0;">Hi ${fullName}!</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Thank you for registering! To complete your registration, please verify your email address using the code below:
              </p>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 12px; text-align: center; margin: 30px 0; box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);">
                <p style="color: white; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
                <h1 style="color: white; letter-spacing: 12px; font-size: 48px; margin: 10px 0; font-weight: bold; text-shadow: 3px 3px 6px rgba(0,0,0,0.3);">${code}</h1>
              </div>
              
              <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="color: #dc2626; margin: 0; font-weight: bold;">⏰ This code expires in 24 hours</p>
              </div>
            </div>
          </div>
        `
      });
      console.log("✅ Verification email sent to:", email);
      res.status(200).json({ ok: true, message: "Email sent successfully" });
    } catch (emailErr) {
      console.error("❌ Email sending failed:", emailErr.message);
      res.status(200).json({ ok: true, message: "Email unavailable, code already shown" });
    }
  } catch (err) {
    console.error("Send verification email error:", err);
    res.status(200).json({ ok: true, message: "Email unavailable, code already shown" });
  }
});


app.get("/api/admin/pending-admins", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, "fullName", role, created_at 
       FROM users 
       WHERE "isAdmin" = FALSE AND email_verified = FALSE AND role != 'user'
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("[v0] Pending admins fetch error:", err);
    res.status(500).json({ error: "Failed to fetch pending admins" });
  }
});

app.post("/api/admin/approve-pending-admin", async (req, res) => {
  try {
    const { adminEmail, approverEmail, approverRole } = req.body;
    
    // Only superadmins can approve
    if (approverRole?.toLowerCase() !== "superadmin") {
      return res.status(403).json({ error: "Only superadmins can approve pending accounts" });
    }
    
    // Get pending admin details
    const { rows: pendingAdmin } = await pool.query(
      `SELECT "fullName", email, role FROM users WHERE email = $1 AND "isAdmin" = FALSE AND email_verified = FALSE`,
      [adminEmail]
    );
    
    if (pendingAdmin.length === 0) {
      return res.status(404).json({ error: "Pending admin not found" });
    }
    
    // Approve by setting both isAdmin and email_verified to true
    await pool.query(
      `UPDATE users SET "isAdmin" = TRUE, email_verified = TRUE WHERE email = $1`,
      [adminEmail]
    );
    
    // Get approver name for logging
    const { rows: approverRows } = await pool.query(
      `SELECT "fullName" FROM users WHERE email = $1`,
      [approverEmail]
    );
    
    await logAdminAction(
      approverEmail,
      approverRows[0]?.fullName || "Superadmin",
      `Approved admin account for ${pendingAdmin[0].fullName} (${adminEmail}) with role: ${pendingAdmin[0].role}`
    );
    
    res.json({ success: true, message: "Admin account approved successfully" });
  } catch (err) {
    console.error("[v0] Approve admin error:", err);
    res.status(500).json({ error: "Failed to approve admin account" });
  }
});

app.post("/api/admin/reject-pending-admin", async (req, res) => {
  try {
    const { adminEmail, approverEmail, approverRole } = req.body;
    
    // Only superadmins can reject
    if (approverRole?.toLowerCase() !== "superadmin") {
      return res.status(403).json({ error: "Only superadmins can reject pending accounts" });
    }
    
    // Get pending admin details for logging
    const { rows: pendingAdmin } = await pool.query(
      `SELECT "fullName", email, role FROM users WHERE email = $1 AND "isAdmin" = FALSE AND email_verified = FALSE`,
      [adminEmail]
    );
    
    if (pendingAdmin.length === 0) {
      return res.status(404).json({ error: "Pending admin not found" });
    }
    
    // Delete the pending admin account
    await pool.query(
      `DELETE FROM users WHERE email = $1`,
      [adminEmail]
    );
    
    // Get approver name for logging
    const { rows: approverRows } = await pool.query(
      `SELECT "fullName" FROM users WHERE email = $1`,
      [approverEmail]
    );
    
    await logAdminAction(
      approverEmail,
      approverRows[0]?.fullName || "Superadmin",
      `Rejected admin account for ${pendingAdmin[0].fullName} (${adminEmail}) with role: ${pendingAdmin[0].role}`
    );

    res.json({ success: true, message: "Admin account rejected and removed" });
  } catch (err) {
    console.error("[v0] Reject admin error:", err);
    res.status(500).json({ error: "Failed to reject admin account" });
  }
});


(async () => {
  try {
    await initializeDatabase();
    console.log("✓ Database tables initialized successfully");
    
    await ensureSeedUsers();
    console.log("✓ Seed users ensured");

    // Start the Express server only after database is ready
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Backend API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  }
})();
