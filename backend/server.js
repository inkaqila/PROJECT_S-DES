const express = require("express");
const cors = require("cors");
const path = require("path");
const { runSDES } = require("./sdes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

app.post("/api/sdes", (req, res) => {
  try {
    const { text, key, mode } = req.body;

    if (!/^[01]{8}$/.test(text)) {
      return res.status(400).json({
        success: false,
        message: "Plaintext/Ciphertext harus tepat 8-bit biner."
      });
    }

    if (!/^[01]{10}$/.test(key)) {
      return res.status(400).json({
        success: false,
        message: "Key harus tepat 10-bit biner."
      });
    }

    if (!["enc", "dec"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Mode harus enc atau dec."
      });
    }

    const result = runSDES(text, key, mode);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => {
  console.log(`S-DES app running on http://localhost:${PORT}`);
});