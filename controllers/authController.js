const auth = require("../config/firebase");

const DURACION_SESION = 24 * 60 * 60 * 1000;

// Configuración de la cookie
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/"
};

// Mostrar registro
exports.mostrarRegistro = (req, res) => {
  res.render("register", { error: null });
};

// Registrar usuario en Firebase
exports.registrar = async (req, res) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    password.length < 6
  ) {
    return res.status(400).render("register", {
      error: "Introduce un correo y una contraseña de 6 caracteres como mínimo."
    });
  }

  try {
    await auth.createUser({
      email: email.trim(),
      password: password
    });

    return res.redirect("/login?registrado=1");

  } catch (error) {
    console.error("Error de registro:", error.code);

    let mensaje = "No se pudo registrar el usuario.";

    if (error.code === "auth/email-already-exists") {
      mensaje = "Este correo ya está registrado.";
    }

    if (error.code === "auth/invalid-email") {
      mensaje = "El correo electrónico no es válido.";
    }

    return res.status(400).render("register", {
      error: mensaje
    });
  }
};

// Mostrar login
exports.mostrarLogin = (req, res) => {
  res.render("login", {
    error: null,
    registrado: req.query.registrado === "1"
  });
};

// Iniciar sesión
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).render("login", {
      error: "Introduce tu correo y contraseña.",
      registrado: false
    });
  }

  try {
    const respuesta = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(process.env.FIREBASE_API_KEY)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          returnSecureToken: true
        })
      }
    );

    const datos = await respuesta.json();

    console.log("Estado Firebase:", respuesta.status);
    console.log("Error Firebase:", datos.error?.message || "Sin error de Firebase");

    if (!respuesta.ok || !datos.idToken) {
      return res.status(401).render("login", {
        error: "Correo o contraseña incorrectos.",
        registrado: false
      });
    }

    // Verificar que el token procede de un inicio reciente
    const usuario = await auth.verifyIdToken(datos.idToken);

    const tiempoTranscurrido =
      Date.now() / 1000 - usuario.auth_time;

    if (tiempoTranscurrido > 300) {
      throw new Error("Inicio de sesión no reciente");
    }

    // Crear una cookie de sesión con Firebase Admin
    const sessionCookie = await auth.createSessionCookie(
      datos.idToken,
      { expiresIn: DURACION_SESION }
    );

    res.cookie("session", sessionCookie, {
      ...cookieOptions,
      maxAge: DURACION_SESION
    });

    return res.redirect("/home");

  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);

    return res.status(500).render("login", {
      error: "No se pudo iniciar sesión. Inténtalo de nuevo.",
      registrado: false
    });
  }
};

// Mostrar home del usuario autenticado
exports.home = (req, res) => {
  res.render("home", {
    email: req.usuario.email,
    uid: req.usuario.uid
  });
};

// Cerrar sesión
exports.logout = (req, res) => {
  res.clearCookie("session", cookieOptions);
  res.redirect("/login");
};