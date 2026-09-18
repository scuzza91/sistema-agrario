const responder = (req, res, status, payload, redirect) => {
    if (req.is("application/json")) {
        return res.status(status).json(payload);
    }

    if (status >= 400) {
        return res.status(status).render("error", {
            titulo: "Error",
            mensaje: payload.mensaje || "No se pudo completar la operacion"
        });
    }

    return res.redirect(redirect);
};

module.exports = responder;
