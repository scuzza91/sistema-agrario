const Productor = require("../models/Productor");
const Lote = require("../models/Lote");
const responder = require("../middleware/responder");

// GET ALL
const obtenerProductores = async (req, res, next) => {
    try {
        const productores = await Productor.find().sort({ nombre: 1 });
        res.json(productores);
    } catch (error) {
        next(error);
    }
};

// GET BY ID
const obtenerProductorPorId = async (req, res, next) => {
    try {
        const productor = await Productor.findById(req.params.id);

        if (!productor) {
            return res.status(404).json({ mensaje: "Productor no encontrado" });
        }

        res.json(productor);
    } catch (error) {
        next(error);
    }
};

// CREATE
const crearProductor = async (req, res, next) => {
    try {
        const { nombre, cuit, localidad, telefono } = req.body;
        const nuevoProductor = await Productor.create({ nombre, cuit, localidad, telefono });

        responder(req, res, 201, {
            mensaje: "Productor creado",
            productor: nuevoProductor
        }, "/ver/productores");
    } catch (error) {
        next(error);
    }
};

// UPDATE
const actualizarProductor = async (req, res, next) => {
    try {
        const { nombre, cuit, localidad, telefono } = req.body;
        const productor = await Productor.findByIdAndUpdate(
            req.params.id,
            { nombre, cuit, localidad, telefono },
            { new: true, runValidators: true }
        );

        if (!productor) {
            return res.status(404).json({ mensaje: "Productor no encontrado" });
        }

        res.json({ mensaje: "Productor actualizado", productor });
    } catch (error) {
        next(error);
    }
};

// DELETE - no se borra si tiene lotes asociados
const eliminarProductor = async (req, res, next) => {
    try {
        const tieneLotes = await Lote.exists({ productor: req.params.id });

        if (tieneLotes) {
            return res.status(400).json({
                mensaje: "No se puede eliminar el productor porque tiene lotes asociados"
            });
        }

        const productor = await Productor.findByIdAndDelete(req.params.id);

        if (!productor) {
            return res.status(404).json({ mensaje: "Productor no encontrado" });
        }

        res.json({ mensaje: "Productor eliminado" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerProductores,
    obtenerProductorPorId,
    crearProductor,
    actualizarProductor,
    eliminarProductor
};
