// Carga los datos de ejemplo de la carpeta data/ (los JSON de la primera entrega) en MongoDB.
// Uso: npm run seed  (borra las colecciones y las vuelve a cargar)
require("dotenv").config();

const mongoose = require("mongoose");
const conectarDB = require("./config/db");

const Productor = require("./models/Productor");
const Tecnico = require("./models/Tecnico");
const TipoCultivo = require("./models/TipoCultivo");
const Lote = require("./models/Lote");
const Observacion = require("./models/Observacion");

const productores = require("./data/productores.json");
const tecnicos = require("./data/tecnicos.json");
const tiposCultivo = require("./data/tiposCultivo.json");
const lotes = require("./data/lotes.json");
const observaciones = require("./data/observaciones.json");

// Inserta los documentos y devuelve un mapa { idViejo: _idNuevo } para armar las referencias
const insertar = async (Modelo, lista) => {
    const ids = {};
    for (const item of lista) {
        const { id, ...datos } = item;
        const doc = await Modelo.create(datos);
        ids[id] = doc._id;
    }
    return ids;
};

const cargarDatos = async () => {
    await conectarDB();

    await Observacion.deleteMany();
    await Lote.deleteMany();
    await Tecnico.deleteMany();
    await TipoCultivo.deleteMany();
    await Productor.deleteMany();

    const idsProductores = await insertar(Productor, productores);
    const idsTecnicos = await insertar(Tecnico, tecnicos);
    const idsTipos = await insertar(TipoCultivo, tiposCultivo);

    const idsLotes = await insertar(Lote, lotes.map((l) => ({
        id: l.id,
        nombre: l.nombre,
        hectareas: l.hectareas,
        productor: idsProductores[l.productorId],
        tipoCultivo: idsTipos[l.tipoCultivoId],
        estado: l.estado
    })));

    await insertar(Observacion, observaciones.map((o) => ({
        id: o.id,
        lote: idsLotes[o.loteId],
        tecnico: idsTecnicos[o.tecnicoId],
        fecha: o.fecha,
        tipo: o.tipo,
        descripcion: o.descripcion
    })));

    console.log("Datos cargados:");
    console.log("- productores:", productores.length);
    console.log("- tecnicos:", tecnicos.length);
    console.log("- tipos de cultivo:", tiposCultivo.length);
    console.log("- lotes:", lotes.length);
    console.log("- observaciones:", observaciones.length);

    await mongoose.disconnect();
};

cargarDatos();
