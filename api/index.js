const { setupApp } = require("../src/setupApp");

module.exports = async (req, res) => {
  try {
    const app = await setupApp();
    return app(req, res);
  } catch (error) {
    console.error("Vercel Serverless Function Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};
