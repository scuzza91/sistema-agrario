const fs = require("fs");
const path = require("path");

const Tecnico = require("../models/Tecnico");
const responder = require("../middleware/responder");

const rutaArchivo = path.join(__dirname, "../data/tecnicos.json");
const rutaObservaciones = path.join(__dirname, "../data/observaciones.json");

const leerTecnicos = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(data);
};

const guardarTecnicos = (tecnicos) => {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(tecnicos, null, 2)
    );
};

const leerObservaciones = () => {
    const data = fs.readFileSync(rutaObservaciones, "utf-8");
    return JSON.parse(data);
};

const obtenerNuevoId = (lista) => {
    if (lista.length === 0) {
        return 1;
    }
    return Math.max(...lista.map((item) => item.id)) + 1;
};

// GET ALL
const obtenerTecnicos = (req, res) => {
    const tecnicos = leerTecnicos();
    res.json(tecnicos);
};

// GET BY ID
const obtenerTecnicoPorId = (req, res) => {
    const tecnicos = leerTecnicos();
    const id = parseInt(req.params.id);
    const tecnico = tecnicos.find((t) => t.id === id);

    if (!tecnico) {
        return res.status(404).json({
            mensaje: "Tecnico no encontrado"
        });
    }

    res.json(tecnico);
};

// CREATE
const crearTecnico = (req, res) => {
    const tecnicos = leerTecnicos();
    const { nombre, apellido, especialidad, matricula } = req.body;

    if (!nombre || !apellido) {
        return responder(req, res, 400, {
            mensaje: "nombre y apellido son obligatorios"
        });
    }

    const id = req.body.id ? parseInt(req.body.id) : obtenerNuevoId(tecnicos);

    if (tecnicos.some((t) => t.id === id)) {
        return responder(req, res, 400, {
            mensaje: "Ya existe un tecnico con ese id"
        });
    }

    const nuevoTecnico = new Tecnico(id, nombre, apellido, especialidad, matricula);
    tecnicos.push(nuevoTecnico);
    guardarTecnicos(tecnicos);

    return responder(req, res, 201, {
        mensaje: "Tecnico creado",
        tecnico: nuevoTecnico
    }, "/ver/tecnicos");
};

// UPDATE
const actualizarTecnico = (req, res) => {
    const tecnicos = leerTecnicos();
    const id = parseInt(req.params.id);
    const tecnico = tecnicos.find((t) => t.id === id);

    if (!tecnico) {
        return res.status(404).json({
            mensaje: "Tecnico no encontrado"
        });
    }

    const { nombre, apellido, especialidad, matricula } = req.body;

    tecnico.nombre = nombre ?? tecnico.nombre;
    tecnico.apellido = apellido ?? tecnico.apellido;
    tecnico.especialidad = especialidad ?? tecnico.especialidad;
    tecnico.matricula = matricula ?? tecnico.matricula;

    guardarTecnicos(tecnicos);

    res.json({
        mensaje: "Tecnico actualizado",
        tecnico
    });
};

// DELETE
const eliminarTecnico = (req, res) => {
    const tecnicos = leerTecnicos();
    const id = parseInt(req.params.id);
    const observaciones = leerObservaciones();

    if (observaciones.some((obs) => obs.tecnicoId === id)) {
        return res.status(400).json({
            mensaje: "No se puede eliminar el tecnico porque tiene observaciones asociadas"
        });
    }

    const nuevosTecnicos = tecnicos.filter((t) => t.id !== id);

    if (tecnicos.length === nuevosTecnicos.length) {
        return res.status(404).json({
            mensaje: "Tecnico no encontrado"
        });
    }

    guardarTecnicos(nuevosTecnicos);

    res.json({
        mensaje: "Tecnico eliminado"
    });
};

module.exports = {
    obtenerTecnicos,
    obtenerTecnicoPorId,
    crearTecnico,
    actualizarTecnico,
    eliminarTecnico
};
