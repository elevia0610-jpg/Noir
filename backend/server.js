require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");

const app = express();

// ===== Middleware =====
app.use(cors({
  origin: [
    "https://noirstudio.co.in",
    "https://www.noirstudio.co.in",
    "https://noir-nu-ten.vercel.app" // optional old Vercel URL
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json()); // parse JSON body

// ===== SendGrid Setup =====
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ===== Health check (optional) =====
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ===== Contact Form Endpoint =====
app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  const msg = {
    to: process.env.RECEIVER_EMAIL,        // Your inbox
    from: process.env.RECEIVER_EMAIL,      // Verified sender
    subject: "New Contact Form Message",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);

    return res.status(200).json({
      success: true,
      message: "Email sent successfully"
    });

  } catch (error) {
    console.error("SendGrid error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send email"
    });
  }
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
