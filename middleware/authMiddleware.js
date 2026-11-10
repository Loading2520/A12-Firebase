const auth = require("../config/firebase");

const verificarSesion = async (req, res, next) => {
  const sessionCookie = req.cookies.session;

  if (!sessionCookie) {
    return res.redirect("/login");
  }

  try {
    const usuario = await auth.verifySessionCookie(
      sessionCookie,
      true
    );

    req.usuario = usuario;

    next();

  } catch (error) {
    res.clearCookie("session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });

    return res.redirect("/login");
  }
};

module.exports = verificarSesion;