const express = require("express");
const config = require("../config.js");
const path = require("path");
const app = express();
const PORT = 3000;
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.json());

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});