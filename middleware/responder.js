// Responde JSON a Postman / Thunder Client y HTML (Pug) a los formularios del navegador
const quiereHtml = (req) => {
    return req.is("application/x-www-form-urlencoded") || req.accepts(["json", "html"]) === "html";
};

const responder = (req, res, status, payload, redirect) => {
    if (!quiereHtml(req)) {
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
