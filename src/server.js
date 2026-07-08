import "dotenv/config";
import express from "express";
import apiRoutes from "./routes/api.js";


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// api routes setup
app.use("/api", apiRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default app;