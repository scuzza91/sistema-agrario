const TipoCultivo = require("../models/TipoCultivo");
const Lote = require("../models/Lote");
const responder = require("../middleware/responder");

// GET ALL
const obtenerTiposCultivo = async (req, res, next) => {
    try {
        const tipos = await TipoCultivo.find().sort({ nombre: 1 });
        res.json(tipos);
    } catch (error) {
        next(error);
    }
};

// GET BY ID
const obtenerTipoCultivoPorId = async (req, res, next) => {
    try {
        const tipo = await TipoCultivo.findById(req.params.id);

        if (!tipo) {
            return res.status(404).json({ mensaje: "Tipo de cultivo no encontrado" });
        }

        res.json(tipo);
    } catch (error) {
        next(error);
    }
};

// CREATE
const crearTipoCultivo = async (req, res, next) => {
    try {
        const { nombre, descripcion, cicloDias } = req.body;
        const nuevoTipo = await TipoCultivo.create({ nombre, descripcion, cicloDias });

        responder(req, res, 201, {
            mensaje: "Tipo de cultivo creado",
            tipoCultivo: nuevoTipo
        }, "/ver/tipos-cultivo");
    } catch (error) {
        next(error);
    }
};

// UPDATE
const actualizarTipoCultivo = async (req, res, next) => {
    try {
        const { nombre, descripcion, cicloDias } = req.body;
        const tipo = await TipoCultivo.findByIdAndUpdate(
            req.params.id,
            { nombre, descripcion, cicloDias },
            { new: true, runValidators: true }
        );

        if (!tipo) {
            return res.status(404).json({ mensaje: "Tipo de cultivo no encontrado" });
        }

        res.json({ mensaje: "Tipo de cultivo actualizado", tipoCultivo: tipo });
    } catch (error) {
        next(error);
    }
};

// DELETE - no se borra si esta usado en lotes
const eliminarTipoCultivo = async (req, res, next) => {
    try {
        const usadoEnLotes = await Lote.exists({ tipoCultivo: req.params.id });

        if (usadoEnLotes) {
            return res.status(400).json({
                mensaje: "No se puede eliminar el tipo de cultivo porque esta usado en lotes"
            });
        }

        const tipo = await TipoCultivo.findByIdAndDelete(req.params.id);

        if (!tipo) {
            return res.status(404).json({ mensaje: "Tipo de cultivo no encontrado" });
        }

        res.json({ mensaje: "Tipo de cultivo eliminado" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerTiposCultivo,
    obtenerTipoCultivoPorId,
    crearTipoCultivo,
    actualizarTipoCultivo,
    eliminarTipoCultivo
};
