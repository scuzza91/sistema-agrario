const mongoose = require("mongoose");

const tipoCultivoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "nombre es obligatorio"],
        unique: true,
        trim: true
    },
    descripcion: String,
    cicloDias: {
        type: Number,
        min: [1, "cicloDias debe ser mayor a 0"]
    }
});

module.exports = mongoose.model("TipoCultivo", tipoCultivoSchema, "tiposCultivo");
