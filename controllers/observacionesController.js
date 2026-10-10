const Observacion = require("../models/Observacion");
const Lote = require("../models/Lote");
const Tecnico = require("../models/Tecnico");
const responder = require("../middleware/responder");

// Verifica que el lote y el tecnico indicados existan
const validarReferencias = async (lote, tecnico) => {
    if (lote && !(await Lote.exists({ _id: lote }))) {
        return "El lote indicado no existe";
    }

    if (tecnico && !(await Tecnico.exists({ _id: tecnico }))) {
        return "El tecnico indicado no existe";
    }

    return null;
};

// GET ALL - se puede filtrar por lote o tecnico (?lote=id&tecnico=id)
const obtenerObservaciones = async (req, res, next) => {
    try {
        const filtro = {};

        if (req.query.lote) {
            filtro.lote = req.query.lote;
        }

        if (req.query.tecnico) {
            filtro.tecnico = req.query.tecnico;
        }

        const observaciones = await Observacion.find(filtro)
            .sort({ fecha: -1 })
            .populate("lote", "nombre")
            .populate("tecnico", "nombre apellido");

        res.json(observaciones);
    } catch (error) {
        next(error);
    }
};

// GET BY ID
const obtenerObservacionPorId = async (req, res, next) => {
    try {
        const observacion = await Observacion.findById(req.params.id)
            .populate("lote")
            .populate("tecnico");

        if (!observacion) {
            return res.status(404).json({ mensaje: "Observacion no encontrada" });
        }

        res.json(observacion);
    } catch (error) {
        next(error);
    }
};

// CREATE
const crearObservacion = async (req, res, next) => {
    try {
        const { lote, tecnico, fecha, tipo, descripcion } = req.body;

        const errorReferencia = await validarReferencias(lote, tecnico);
        if (errorReferencia) {
            return responder(req, res, 400, { mensaje: errorReferencia });
        }

        // si el formulario manda la fecha vacia se usa la fecha actual (default del Schema)
        const nuevaObservacion = await Observacion.create({
            lote,
            tecnico,
            fecha: fecha || undefined,
            tipo,
            descripcion
        });

        responder(req, res, 201, {
            mensaje: "Observacion creada",
            observacion: nuevaObservacion
        }, "/ver/observaciones");
    } catch (error) {
        next(error);
    }
};

// UPDATE
const actualizarObservacion = async (req, res, next) => {
    try {
        const { lote, tecnico, fecha, tipo, descripcion } = req.body;

        const errorReferencia = await validarReferencias(lote, tecnico);
        if (errorReferencia) {
            return res.status(400).json({ mensaje: errorReferencia });
        }

        const observacion = await Observacion.findByIdAndUpdate(
            req.params.id,
            { lote, tecnico, fecha, tipo, descripcion },
            { new: true, runValidators: true }
        );

        if (!observacion) {
            return res.status(404).json({ mensaje: "Observacion no encontrada" });
        }

        res.json({ mensaje: "Observacion actualizada", observacion });
    } catch (error) {
        next(error);
    }
};

// DELETE
const eliminarObservacion = async (req, res, next) => {
    try {
        const observacion = await Observacion.findByIdAndDelete(req.params.id);

        if (!observacion) {
            return res.status(404).json({ mensaje: "Observacion no encontrada" });
        }

        res.json({ mensaje: "Observacion eliminada" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerObservaciones,
    obtenerObservacionPorId,
    crearObservacion,
    actualizarObservacion,
    eliminarObservacion
};
