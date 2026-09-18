const fs = require("fs");
const path = require("path");

const leerJson = (nombre) => {
    const ruta = path.join(__dirname, "../data", nombre);
    const data = fs.readFileSync(ruta, "utf-8");
    return JSON.parse(data);
};

const verInicio = (req, res) => {
    res.render("index", {
        titulo: "Sistema agrario"
    });
};

const verProductores = (req, res) => {
    res.render("productores", {
        titulo: "Productores",
        productores: leerJson("productores.json")
    });
};

const verTecnicos = (req, res) => {
    res.render("tecnicos", {
        titulo: "Tecnicos",
        tecnicos: leerJson("tecnicos.json")
    });
};

const verTiposCultivo = (req, res) => {
    res.render("tiposCultivo", {
        titulo: "Tipos de cultivo",
        tipos: leerJson("tiposCultivo.json")
    });
};

const verLotes = (req, res) => {
    res.render("lotes", {
        titulo: "Lotes",
        lotes: leerJson("lotes.json"),
        productores: leerJson("productores.json"),
        tipos: leerJson("tiposCultivo.json")
    });
};

const verObservaciones = (req, res) => {
    res.render("observaciones", {
        titulo: "Observaciones",
        observaciones: leerJson("observaciones.json"),
        lotes: leerJson("lotes.json"),
        tecnicos: leerJson("tecnicos.json")
    });
};

module.exports = {
    verInicio,
    verProductores,
    verTecnicos,
    verTiposCultivo,
    verLotes,
    verObservaciones
};
