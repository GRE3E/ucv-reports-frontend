const express = require("express");
const app = express();
const port = 3000;

// Middleware to handle JSON requests
app.use(express.json());

// Example route
app.get("/", (req, res) => {
  res.send("Frontend listo :D");
});

// Start the server
app.listen(port, () => {
  console.log(`Server Frontend levantado en http://localhost:${port}`);
});
