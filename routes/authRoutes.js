const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const verificarSesion = require("../middleware/authMiddleware");

// Página inicial
router.get("/", (req, res) => {
  res.redirect("/login");
});

// Registro
router.get("/register", authController.mostrarRegistro);
router.post("/register", authController.registrar);

// Inicio de sesión
router.get("/login", authController.mostrarLogin);
router.post("/login", authController.login);

// Página privada
router.get("/home", verificarSesion, authController.home);

// Cerrar sesión
router.get("/logout", authController.logout);

module.exports = router;