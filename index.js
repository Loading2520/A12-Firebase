require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use("/", authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});