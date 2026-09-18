const fs = require("fs");
const path = require("path");

const Observacion = require("../models/Observacion");
const responder = require("../middleware/responder");

const rutaArchivo = path.join(__dirname, "../data/observaciones.json");
const rutaLotes = path.join(__dirname, "../data/lotes.json");
const rutaTecnicos = path.join(__dirname, "../data/tecnicos.json");

const leerObservaciones = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(data);
};

const guardarObservaciones = (observaciones) => {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(observaciones, null, 2)
    );
};

const leerJson = (ruta) => {
    const data = fs.readFileSync(ruta, "utf-8");
    return JSON.parse(data);
};

const obtenerNuevoId = (lista) => {
    if (lista.length === 0) {
        return 1;
    }
    return Math.max(...lista.map((item) => item.id)) + 1;
};

// GET ALL - se puede filtrar por loteId o tecnicoId
const obtenerObservaciones = (req, res) => {
    let observaciones = leerObservaciones();
    const loteId = req.query.loteId;
    const tecnicoId = req.query.tecnicoId;

    if (loteId) {
        observaciones = observaciones.filter((obs) => obs.loteId === parseInt(loteId));
    }

    if (tecnicoId) {
        observaciones = observaciones.filter((obs) => obs.tecnicoId === parseInt(tecnicoId));
    }

    res.json(observaciones);
};

// GET BY ID
const obtenerObservacionPorId = (req, res) => {
    const observaciones = leerObservaciones();
    const id = parseInt(req.params.id);
    const observacion = observaciones.find((obs) => obs.id === id);

    if (!observacion) {
        return res.status(404).json({
            mensaje: "Observacion no encontrada"
        });
    }

    res.json(observacion);
};

// CREATE
const crearObservacion = (req, res) => {
    const observaciones = leerObservaciones();
    const { loteId, tecnicoId, fecha, tipo, descripcion } = req.body;

    if (!loteId || !tecnicoId || !tipo) {
        return responder(req, res, 400, {
            mensaje: "loteId, tecnicoId y tipo son obligatorios"
        });
    }

    const lotes = leerJson(rutaLotes);
    const tecnicos = leerJson(rutaTecnicos);

    if (!lotes.some((lote) => lote.id === parseInt(loteId))) {
        return responder(req, res, 400, {
            mensaje: "El lote indicado no existe"
        });
    }

    if (!tecnicos.some((tecnico) => tecnico.id === parseInt(tecnicoId))) {
        return responder(req, res, 400, {
            mensaje: "El tecnico indicado no existe"
        });
    }

    const id = req.body.id ? parseInt(req.body.id) : obtenerNuevoId(observaciones);

    if (observaciones.some((obs) => obs.id === id)) {
        return responder(req, res, 400, {
            mensaje: "Ya existe una observacion con ese id"
        });
    }

    const nuevaObservacion = new Observacion(
        id,
        parseInt(loteId),
        parseInt(tecnicoId),
        fecha || new Date().toISOString().slice(0, 10),
        tipo,
        descripcion
    );

    observaciones.push(nuevaObservacion);
    guardarObservaciones(observaciones);

    return responder(req, res, 201, {
        mensaje: "Observacion creada",
        observacion: nuevaObservacion
    }, "/ver/observaciones");
};

// UPDATE
const actualizarObservacion = (req, res) => {
    const observaciones = leerObservaciones();
    const id = parseInt(req.params.id);
    const observacion = observaciones.find((obs) => obs.id === id);

    if (!observacion) {
        return res.status(404).json({
            mensaje: "Observacion no encontrada"
        });
    }

    const { loteId, tecnicoId, fecha, tipo, descripcion } = req.body;

    if (loteId !== undefined) {
        const lotes = leerJson(rutaLotes);
        if (!lotes.some((lote) => lote.id === parseInt(loteId))) {
            return res.status(400).json({
                mensaje: "El lote indicado no existe"
            });
        }
    }

    if (tecnicoId !== undefined) {
        const tecnicos = leerJson(rutaTecnicos);
        if (!tecnicos.some((tecnico) => tecnico.id === parseInt(tecnicoId))) {
            return res.status(400).json({
                mensaje: "El tecnico indicado no existe"
            });
        }
    }

    observacion.loteId = loteId !== undefined ? parseInt(loteId) : observacion.loteId;
    observacion.tecnicoId = tecnicoId !== undefined ? parseInt(tecnicoId) : observacion.tecnicoId;
    observacion.fecha = fecha ?? observacion.fecha;
    observacion.tipo = tipo ?? observacion.tipo;
    observacion.descripcion = descripcion ?? observacion.descripcion;

    guardarObservaciones(observaciones);

    res.json({
        mensaje: "Observacion actualizada",
        observacion
    });
};

// DELETE
const eliminarObservacion = (req, res) => {
    const observaciones = leerObservaciones();
    const id = parseInt(req.params.id);
    const nuevasObservaciones = observaciones.filter((obs) => obs.id !== id);

    if (observaciones.length === nuevasObservaciones.length) {
        return res.status(404).json({
            mensaje: "Observacion no encontrada"
        });
    }

    guardarObservaciones(nuevasObservaciones);

    res.json({
        mensaje: "Observacion eliminada"
    });
};

module.exports = {
    obtenerObservaciones,
    obtenerObservacionPorId,
    crearObservacion,
    actualizarObservacion,
    eliminarObservacion
};
