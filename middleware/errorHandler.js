const responder = require("./responder");

// Ruta no encontrada
const noEncontrado = (req, res) => {
    responder(req, res, 404, {
        mensaje: "Ruta no encontrada: " + req.method + " " + req.originalUrl
    });
};

// Manejo centralizado de errores (lo usan los controladores con next(error))
const manejarErrores = (error, req, res, next) => {
    // Validaciones del Schema de Mongoose (required, min, enum, match)
    if (error.name === "ValidationError") {
        const mensajes = Object.values(error.errors).map((e) => e.message);
        return responder(req, res, 400, { mensaje: mensajes.join(", ") });
    }

    // Id con formato invalido (no es un ObjectId)
    if (error.name === "CastError") {
        return responder(req, res, 400, { mensaje: "El valor de " + error.path + " no es valido" });
    }

    // Indice unique repetido (ej: cuit duplicado)
    if (error.code === 11000) {
        const campo = Object.keys(error.keyValue)[0];
        return responder(req, res, 400, { mensaje: "Ya existe un registro con ese " + campo });
    }

    console.error(error);
    responder(req, res, 500, { mensaje: "Error interno del servidor" });
};

module.exports = { noEncontrado, manejarErrores };
