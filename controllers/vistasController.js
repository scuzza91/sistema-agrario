const Productor = require("../models/Productor");
const Tecnico = require("../models/Tecnico");
const TipoCultivo = require("../models/TipoCultivo");
const Lote = require("../models/Lote");
const Observacion = require("../models/Observacion");

const verInicio = (req, res) => {
    res.render("index", {
        titulo: "Sistema agrario"
    });
};

const verProductores = async (req, res, next) => {
    try {
        res.render("productores", {
            titulo: "Productores",
            productores: await Productor.find().sort({ nombre: 1 })
        });
    } catch (error) {
        next(error);
    }
};

const verTecnicos = async (req, res, next) => {
    try {
        res.render("tecnicos", {
            titulo: "Tecnicos",
            tecnicos: await Tecnico.find().sort({ apellido: 1 })
        });
    } catch (error) {
        next(error);
    }
};

const verTiposCultivo = async (req, res, next) => {
    try {
        res.render("tiposCultivo", {
            titulo: "Tipos de cultivo",
            tipos: await TipoCultivo.find().sort({ nombre: 1 })
        });
    } catch (error) {
        next(error);
    }
};

const verLotes = async (req, res, next) => {
    try {
        res.render("lotes", {
            titulo: "Lotes",
            lotes: await Lote.find().populate("productor").populate("tipoCultivo"),
            productores: await Productor.find().sort({ nombre: 1 }),
            tipos: await TipoCultivo.find().sort({ nombre: 1 })
        });
    } catch (error) {
        next(error);
    }
};

const verObservaciones = async (req, res, next) => {
    try {
        res.render("observaciones", {
            titulo: "Observaciones",
            observaciones: await Observacion.find().sort({ fecha: -1 }).populate("lote").populate("tecnico"),
            lotes: await Lote.find().sort({ nombre: 1 }),
            tecnicos: await Tecnico.find().sort({ apellido: 1 })
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verInicio,
    verProductores,
    verTecnicos,
    verTiposCultivo,
    verLotes,
    verObservaciones
};
