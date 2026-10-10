const Lote = require("../models/Lote");
const Productor = require("../models/Productor");
const TipoCultivo = require("../models/TipoCultivo");
const Observacion = require("../models/Observacion");
const responder = require("../middleware/responder");

// Verifica que el productor y el tipo de cultivo indicados existan
const validarReferencias = async (productor, tipoCultivo) => {
    if (productor && !(await Productor.exists({ _id: productor }))) {
        return "El productor indicado no existe";
    }

    if (tipoCultivo && !(await TipoCultivo.exists({ _id: tipoCultivo }))) {
        return "El tipo de cultivo indicado no existe";
    }

    return null;
};

// GET ALL - se puede filtrar por productor (?productor=id)
const obtenerLotes = async (req, res, next) => {
    try {
        const filtro = {};

        if (req.query.productor) {
            filtro.productor = req.query.productor;
        }

        const lotes = await Lote.find(filtro)
            .populate("productor", "nombre")
            .populate("tipoCultivo", "nombre");

        res.json(lotes);
    } catch (error) {
        next(error);
    }
};

// GET BY ID
const obtenerLotePorId = async (req, res, next) => {
    try {
        const lote = await Lote.findById(req.params.id)
            .populate("productor")
            .populate("tipoCultivo");

        if (!lote) {
            return res.status(404).json({ mensaje: "Lote no encontrado" });
        }

        res.json(lote);
    } catch (error) {
        next(error);
    }
};

// CREATE
const crearLote = async (req, res, next) => {
    try {
        const { nombre, hectareas, productor, tipoCultivo, estado } = req.body;

        const errorReferencia = await validarReferencias(productor, tipoCultivo);
        if (errorReferencia) {
            return responder(req, res, 400, { mensaje: errorReferencia });
        }

        const nuevoLote = await Lote.create({ nombre, hectareas, productor, tipoCultivo, estado });

        responder(req, res, 201, {
            mensaje: "Lote creado",
            lote: nuevoLote
        }, "/ver/lotes");
    } catch (error) {
        next(error);
    }
};

// UPDATE
const actualizarLote = async (req, res, next) => {
    try {
        const { nombre, hectareas, productor, tipoCultivo, estado } = req.body;

        const errorReferencia = await validarReferencias(productor, tipoCultivo);
        if (errorReferencia) {
            return res.status(400).json({ mensaje: errorReferencia });
        }

        const lote = await Lote.findByIdAndUpdate(
            req.params.id,
            { nombre, hectareas, productor, tipoCultivo, estado },
            { new: true, runValidators: true }
        );

        if (!lote) {
            return res.status(404).json({ mensaje: "Lote no encontrado" });
        }

        res.json({ mensaje: "Lote actualizado", lote });
    } catch (error) {
        next(error);
    }
};

// DELETE - no se borra si tiene observaciones
const eliminarLote = async (req, res, next) => {
    try {
        const tieneObservaciones = await Observacion.exists({ lote: req.params.id });

        if (tieneObservaciones) {
            return res.status(400).json({
                mensaje: "No se puede eliminar el lote porque tiene observaciones asociadas"
            });
        }

        const lote = await Lote.findByIdAndDelete(req.params.id);

        if (!lote) {
            return res.status(404).json({ mensaje: "Lote no encontrado" });
        }

        res.json({ mensaje: "Lote eliminado" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerLotes,
    obtenerLotePorId,
    crearLote,
    actualizarLote,
    eliminarLote
};
