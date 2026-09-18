const fs = require("fs");
const path = require("path");

const Productor = require("../models/Productor");
const responder = require("../middleware/responder");

const rutaArchivo = path.join(__dirname, "../data/productores.json");
const rutaLotes = path.join(__dirname, "../data/lotes.json");

const leerProductores = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(data);
};

const guardarProductores = (productores) => {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(productores, null, 2)
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
const obtenerProductores = (req, res) => {
    const productores = leerProductores();
    res.json(productores);
};

// GET BY ID
const obtenerProductorPorId = (req, res) => {
    const productores = leerProductores();
    const id = parseInt(req.params.id);
    const productor = productores.find((p) => p.id === id);

    if (!productor) {
        return res.status(404).json({
            mensaje: "Productor no encontrado"
        });
    }

    res.json(productor);
};

// CREATE
const crearProductor = (req, res) => {
    const productores = leerProductores();
    const { nombre, cuit, localidad, telefono } = req.body;

    if (!nombre || !cuit) {
        return responder(req, res, 400, {
            mensaje: "nombre y cuit son obligatorios"
        });
    }

    const id = req.body.id ? parseInt(req.body.id) : obtenerNuevoId(productores);

    if (productores.some((p) => p.id === id)) {
        return responder(req, res, 400, {
            mensaje: "Ya existe un productor con ese id"
        });
    }

    const nuevoProductor = new Productor(id, nombre, cuit, localidad, telefono);
    productores.push(nuevoProductor);
    guardarProductores(productores);

    return responder(req, res, 201, {
        mensaje: "Productor creado",
        productor: nuevoProductor
    }, "/ver/productores");
};

// UPDATE
const actualizarProductor = (req, res) => {
    const productores = leerProductores();
    const id = parseInt(req.params.id);
    const productor = productores.find((p) => p.id === id);

    if (!productor) {
        return res.status(404).json({
            mensaje: "Productor no encontrado"
        });
    }

    const { nombre, cuit, localidad, telefono } = req.body;

    productor.nombre = nombre ?? productor.nombre;
    productor.cuit = cuit ?? productor.cuit;
    productor.localidad = localidad ?? productor.localidad;
    productor.telefono = telefono ?? productor.telefono;

    guardarProductores(productores);

    res.json({
        mensaje: "Productor actualizado",
        productor
    });
};

// DELETE
const eliminarProductor = (req, res) => {
    const productores = leerProductores();
    const id = parseInt(req.params.id);
    const lotes = leerLotes();

    if (lotes.some((lote) => lote.productorId === id)) {
        return res.status(400).json({
            mensaje: "No se puede eliminar el productor porque tiene lotes asociados"
        });
    }

    const nuevosProductores = productores.filter((p) => p.id !== id);

    if (productores.length === nuevosProductores.length) {
        return res.status(404).json({
            mensaje: "Productor no encontrado"
        });
    }

    guardarProductores(nuevosProductores);

    res.json({
        mensaje: "Productor eliminado"
    });
};

module.exports = {
    obtenerProductores,
    obtenerProductorPorId,
    crearProductor,
    actualizarProductor,
    eliminarProductor
};
