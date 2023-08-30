import "dotenv/config";
import "./db";

import "./models/video";
import "./models/Comment";
import app from "./server.js";
import "./models/User";
const PORT = process.env.PORT || "4000";

app.listen(PORT, () => {
  console.log(`server listening on  port ${PORT}`);
});
