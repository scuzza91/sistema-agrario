const mongoose = require("mongoose");

const loteSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "nombre es obligatorio"],
        trim: true
    },
    hectareas: {
        type: Number,
        required: [true, "hectareas es obligatorio"],
        min: [0.1, "hectareas debe ser mayor a 0"]
    },
    productor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Productor",
        required: [true, "productor es obligatorio"]
    },
    tipoCultivo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TipoCultivo",
        required: [true, "tipoCultivo es obligatorio"]
    },
    estado: {
        type: String,
        enum: {
            values: ["activo", "en barbecho", "cosechado"],
            message: "estado debe ser activo, en barbecho o cosechado"
        },
        default: "activo"
    }
});

module.exports = mongoose.model("Lote", loteSchema, "lotes");
