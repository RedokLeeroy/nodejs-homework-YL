const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const { DB_PASS } = process.env;

app.listen(3000, () => {
  console.log("Server running. Use our API on port: 3000");
});

mongoose
  .connect(DB_PASS)
  .then(() => console.log("database connected successfuly"))
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
