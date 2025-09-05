import { withAuth } from "./_auth.js";

function base(req, res) {
  return res.status(200).json({
    success: true,
    message: "Healthy, system is healthy as fck",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || "development"
    }
  });
}

export default withAuth(base);
