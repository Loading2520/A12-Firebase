const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const path = require("path");

const rutaCredenciales = path.resolve(
  process.cwd(),
  process.env.FIREBASE_SERVICE_ACCOUNT
);

initializeApp({
  credential: cert(rutaCredenciales)
});

const auth = getAuth();

module.exports = auth;