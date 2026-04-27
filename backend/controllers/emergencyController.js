const Emergency = require("../models/Emergency");
const sendEmail = require("../utils/sendEmail");

// 🚨 CREATE EMERGENCY
exports.createEmergency = async (req, res) => {
  console.log("ADMIN_EMAIL", process.env.ADMIN_EMAIL);

  try {
    console.log("REQ.USER:", req.user);

    const { lat, lng } = req.body;

    const emergency = await Emergency.create({
      user: req.user.id,
      location: { lat, lng },
      status: "pending",
    });

    const populatedEmergency = await emergency.populate("user", "name email");

    // Timestamp
    const time = new Date().toLocaleString();

    // SEND EMAIL TO ADMIN
    try {
      await sendEmail(
        process.env.ADMIN_EMAIL,
        "🚨 New Emergency Triggered",
        `
        <div style="font-family: Arial; padding: 20px; max-width:500px;">
          
          <h2 style="color:#dc2626;">🚨 New Emergency Alert</h2>

          <p><strong>User:</strong> ${populatedEmergency.user.name}</p>
          <p><strong>Email:</strong> ${populatedEmergency.user.email}</p>
          <p><strong>Location:</strong> ${lat}, ${lng}</p>
          <p><strong>Time:</strong> ${time}</p>

          <a href="https://www.google.com/maps?q=${lat},${lng}" 
             target="_blank"
             style="display:inline-block; margin-top:10px; padding:12px 18px; background:#dc2626; color:white; text-decoration:none; border-radius:6px; font-weight:bold;">
             📍 Open in Google Maps
          </a>

          <p style="margin-top:20px; color:#6b7280;">
            Immediate attention required.
          </p>

          <hr style="margin-top:20px;" />

          <p style="color:#9ca3af; font-size:12px;">
            CrisisSync Emergency System 🚑 <br/>
            This is an automated alert.
          </p>

        </div>
        `
      );

      console.log("📧 Trigger email sent to admin");
    } catch (emailErr) {
      console.error("❌ Trigger email failed:", emailErr.message);
    }

    // 🔥 SOCKET
    req.app.get("io").emit("newEmergency", populatedEmergency);

    res.status(201).json(populatedEmergency);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// GET ALL
exports.getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(emergencies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// RESOLVE
exports.resolveEmergency = async (req, res) => {
  console.log("REQ.USER 👉", req.user);

  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    ).populate("user", "name email");

    if (!emergency) {
      return res.status(404).json({ msg: "Emergency not found" });
    }

    // Timestamp
    const time = new Date().toLocaleString();

    // EMAIL TO USER
    if (emergency.user?.email) {
      try {
        await sendEmail(
          emergency.user.email,
          "✅ Emergency Resolved - CrisisSync",
          `
          <div style="font-family: Arial; padding: 20px; max-width:500px;">

            <h2 style="color:#16a34a;">✅ Emergency Resolved</h2>

            <p>Hi ${emergency.user.name},</p>

            <p style="margin-top:10px;">
              Your emergency has been successfully handled.
            </p>

            <p><strong>Resolved At:</strong> ${time}</p>

            <p style="margin-top:15px; color:#16a34a; font-weight:bold;">
              ✔ Help reached your location
            </p>

            <p style="margin-top:20px;">
              Stay safe and take care.
            </p>

            <hr style="margin-top:20px;" />

            <p style="color:#9ca3af; font-size:12px;">
              CrisisSync Emergency System 🚑
            </p>

          </div>
          `
        );

        console.log("📧 Resolve email sent to user");
      } catch (emailErr) {
        console.error("❌ Resolve email failed:", emailErr.message);
      }
    }

    // SOCKET
    req.app.get("io").emit("emergencyUpdated", emergency);

    res.json(emergency);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};