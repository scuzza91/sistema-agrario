const fs = require("fs");
const path = require("path");

const TipoCultivo = require("../models/TipoCultivo");
const responder = require("../middleware/responder");

const rutaArchivo = path.join(__dirname, "../data/tiposCultivo.json");
const rutaLotes = path.join(__dirname, "../data/lotes.json");

const leerTiposCultivo = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(data);
};

const guardarTiposCultivo = (tipos) => {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(tipos, null, 2)
    );
};

const leerLotes = () => {
    const data = fs.readFileSync(rutaLotes, "utf-8");
    return JSON.parse(data);
};

const obtenerNuevoId = (lista) => {
    if (lista.length === 0) {
        return 1;
    }
    return Math.max(...lista.map((item) => item.id)) + 1;
};

// GET ALL
const obtenerTiposCultivo = (req, res) => {
    const tipos = leerTiposCultivo();
    res.json(tipos);
};

// GET BY ID
const obtenerTipoCultivoPorId = (req, res) => {
    const tipos = leerTiposCultivo();
    const id = parseInt(req.params.id);
    const tipo = tipos.find((t) => t.id === id);

    if (!tipo) {
        return res.status(404).json({
            mensaje: "Tipo de cultivo no encontrado"
        });
    }

    res.json(tipo);
};

// CREATE
const crearTipoCultivo = (req, res) => {
    const tipos = leerTiposCultivo();
    const { nombre, descripcion, cicloDias } = req.body;

    if (!nombre) {
        return responder(req, res, 400, {
            mensaje: "nombre es obligatorio"
        });
    }

    const id = req.body.id ? parseInt(req.body.id) : obtenerNuevoId(tipos);

    if (tipos.some((t) => t.id === id)) {
        return responder(req, res, 400, {
            mensaje: "Ya existe un tipo de cultivo con ese id"
        });
    }

    const nuevoTipo = new TipoCultivo(id, nombre, descripcion, cicloDias ? Number(cicloDias) : cicloDias);
    tipos.push(nuevoTipo);
    guardarTiposCultivo(tipos);

    return responder(req, res, 201, {
        mensaje: "Tipo de cultivo creado",
        tipoCultivo: nuevoTipo
    }, "/ver/tipos-cultivo");
};

// UPDATE
const actualizarTipoCultivo = (req, res) => {
    const tipos = leerTiposCultivo();
    const id = parseInt(req.params.id);
    const tipo = tipos.find((t) => t.id === id);

    if (!tipo) {
        return res.status(404).json({
            mensaje: "Tipo de cultivo no encontrado"
        });
    }

    const { nombre, descripcion, cicloDias } = req.body;

    tipo.nombre = nombre ?? tipo.nombre;
    tipo.descripcion = descripcion ?? tipo.descripcion;
    tipo.cicloDias = cicloDias ?? tipo.cicloDias;

    guardarTiposCultivo(tipos);

    res.json({
        mensaje: "Tipo de cultivo actualizado",
        tipoCultivo: tipo
    });
};

// DELETE
const eliminarTipoCultivo = (req, res) => {
    const tipos = leerTiposCultivo();
    const id = parseInt(req.params.id);
    const lotes = leerLotes();

    if (lotes.some((lote) => lote.tipoCultivoId === id)) {
        return res.status(400).json({
            mensaje: "No se puede eliminar el tipo de cultivo porque esta usado en lotes"
        });
    }

    const nuevosTipos = tipos.filter((t) => t.id !== id);

    if (tipos.length === nuevosTipos.length) {
        return res.status(404).json({
            mensaje: "Tipo de cultivo no encontrado"
        });
    }

    guardarTiposCultivo(nuevosTipos);

    res.json({
        mensaje: "Tipo de cultivo eliminado"
    });
};

module.exports = {
    obtenerTiposCultivo,
    obtenerTipoCultivoPorId,
    crearTipoCultivo,
    actualizarTipoCultivo,
    eliminarTipoCultivo
};
