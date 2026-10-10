const Tecnico = require("../models/Tecnico");
const Observacion = require("../models/Observacion");
const responder = require("../middleware/responder");

// GET ALL
const obtenerTecnicos = async (req, res, next) => {
    try {
        const tecnicos = await Tecnico.find().sort({ apellido: 1 });
        res.json(tecnicos);
    } catch (error) {
        next(error);
    }
};

// GET BY ID
const obtenerTecnicoPorId = async (req, res, next) => {
    try {
        const tecnico = await Tecnico.findById(req.params.id);

        if (!tecnico) {
            return res.status(404).json({ mensaje: "Tecnico no encontrado" });
        }

        res.json(tecnico);
    } catch (error) {
        next(error);
    }
};

// CREATE
const crearTecnico = async (req, res, next) => {
    try {
        const { nombre, apellido, especialidad, matricula } = req.body;
        const nuevoTecnico = await Tecnico.create({ nombre, apellido, especialidad, matricula });

        responder(req, res, 201, {
            mensaje: "Tecnico creado",
            tecnico: nuevoTecnico
        }, "/ver/tecnicos");
    } catch (error) {
        next(error);
    }
};

// UPDATE
const actualizarTecnico = async (req, res, next) => {
    try {
        const { nombre, apellido, especialidad, matricula } = req.body;
        const tecnico = await Tecnico.findByIdAndUpdate(
            req.params.id,
            { nombre, apellido, especialidad, matricula },
            { new: true, runValidators: true }
        );

        if (!tecnico) {
            return res.status(404).json({ mensaje: "Tecnico no encontrado" });
        }

        res.json({ mensaje: "Tecnico actualizado", tecnico });
    } catch (error) {
        next(error);
    }
};

// DELETE - no se borra si cargo observaciones
const eliminarTecnico = async (req, res, next) => {
    try {
        const tieneObservaciones = await Observacion.exists({ tecnico: req.params.id });

        if (tieneObservaciones) {
            return res.status(400).json({
                mensaje: "No se puede eliminar el tecnico porque tiene observaciones asociadas"
            });
        }

        const tecnico = await Tecnico.findByIdAndDelete(req.params.id);

        if (!tecnico) {
            return res.status(404).json({ mensaje: "Tecnico no encontrado" });
        }

        res.json({ mensaje: "Tecnico eliminado" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerTecnicos,
    obtenerTecnicoPorId,
    crearTecnico,
    actualizarTecnico,
    eliminarTecnico
};
