const fs = require("fs");
const path = require("path");

const Lote = require("../models/Lote");
const responder = require("../middleware/responder");

const rutaArchivo = path.join(__dirname, "../data/lotes.json");
const rutaProductores = path.join(__dirname, "../data/productores.json");
const rutaTiposCultivo = path.join(__dirname, "../data/tiposCultivo.json");
const rutaObservaciones = path.join(__dirname, "../data/observaciones.json");

const leerLotes = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(data);
};

const guardarLotes = (lotes) => {
    fs.writeFileSync(
        rutaArchivo,
        JSON.stringify(lotes, null, 2)
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

// GET ALL - se puede filtrar por productorId
const obtenerLotes = (req, res) => {
    let lotes = leerLotes();
    const productorId = req.query.productorId;

    if (productorId) {
        lotes = lotes.filter((lote) => lote.productorId === parseInt(productorId));
    }

    res.json(lotes);
};

// GET BY ID
const obtenerLotePorId = (req, res) => {
    const lotes = leerLotes();
    const id = parseInt(req.params.id);
    const lote = lotes.find((l) => l.id === id);

    if (!lote) {
        return res.status(404).json({
            mensaje: "Lote no encontrado"
        });
    }

    res.json(lote);
};

// CREATE
const crearLote = (req, res) => {
    const lotes = leerLotes();
    const { nombre, hectareas, productorId, tipoCultivoId, estado } = req.body;

    if (!nombre || !productorId || !tipoCultivoId) {
        return responder(req, res, 400, {
            mensaje: "nombre, productorId y tipoCultivoId son obligatorios"
        });
    }

    if (hectareas !== undefined && Number(hectareas) <= 0) {
        return responder(req, res, 400, {
            mensaje: "hectareas debe ser mayor a 0"
        });
    }

    const productores = leerJson(rutaProductores);
    const tipos = leerJson(rutaTiposCultivo);

    if (!productores.some((p) => p.id === parseInt(productorId))) {
        return responder(req, res, 400, {
            mensaje: "El productor indicado no existe"
        });
    }

    if (!tipos.some((t) => t.id === parseInt(tipoCultivoId))) {
        return responder(req, res, 400, {
            mensaje: "El tipo de cultivo indicado no existe"
        });
    }

    const id = req.body.id ? parseInt(req.body.id) : obtenerNuevoId(lotes);

    if (lotes.some((l) => l.id === id)) {
        return responder(req, res, 400, {
            mensaje: "Ya existe un lote con ese id"
        });
    }

    const nuevoLote = new Lote(
        id,
        nombre,
        Number(hectareas),
        parseInt(productorId),
        parseInt(tipoCultivoId),
        estado || "activo"
    );

    lotes.push(nuevoLote);
    guardarLotes(lotes);

    return responder(req, res, 201, {
        mensaje: "Lote creado",
        lote: nuevoLote
    }, "/ver/lotes");
};

// UPDATE
const actualizarLote = (req, res) => {
    const lotes = leerLotes();
    const id = parseInt(req.params.id);
    const lote = lotes.find((l) => l.id === id);

    if (!lote) {
        return res.status(404).json({
            mensaje: "Lote no encontrado"
        });
    }

    const { nombre, hectareas, productorId, tipoCultivoId, estado } = req.body;

    if (hectareas !== undefined && Number(hectareas) <= 0) {
        return res.status(400).json({
            mensaje: "hectareas debe ser mayor a 0"
        });
    }

    if (productorId !== undefined) {
        const productores = leerJson(rutaProductores);
        if (!productores.some((p) => p.id === parseInt(productorId))) {
            return res.status(400).json({
                mensaje: "El productor indicado no existe"
            });
        }
    }

    if (tipoCultivoId !== undefined) {
        const tipos = leerJson(rutaTiposCultivo);
        if (!tipos.some((t) => t.id === parseInt(tipoCultivoId))) {
            return res.status(400).json({
                mensaje: "El tipo de cultivo indicado no existe"
            });
        }
    }

    lote.nombre = nombre ?? lote.nombre;
    lote.hectareas = hectareas ?? lote.hectareas;
    lote.productorId = productorId !== undefined ? parseInt(productorId) : lote.productorId;
    lote.tipoCultivoId = tipoCultivoId !== undefined ? parseInt(tipoCultivoId) : lote.tipoCultivoId;
    lote.estado = estado ?? lote.estado;

    guardarLotes(lotes);

    res.json({
        mensaje: "Lote actualizado",
        lote
    });
};

// DELETE
const eliminarLote = (req, res) => {
    const lotes = leerLotes();
    const id = parseInt(req.params.id);
    const observaciones = leerJson(rutaObservaciones);

    if (observaciones.some((obs) => obs.loteId === id)) {
        return res.status(400).json({
            mensaje: "No se puede eliminar el lote porque tiene observaciones asociadas"
        });
    }

    const nuevosLotes = lotes.filter((l) => l.id !== id);

    if (lotes.length === nuevosLotes.length) {
        return res.status(404).json({
            mensaje: "Lote no encontrado"
        });
    }

    guardarLotes(nuevosLotes);

    res.json({
        mensaje: "Lote eliminado"
    });
};

module.exports = {
    obtenerLotes,
    obtenerLotePorId,
    crearLote,
    actualizarLote,
    eliminarLote
};
