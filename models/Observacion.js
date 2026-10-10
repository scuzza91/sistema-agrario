const mongoose = require("mongoose");

const observacionSchema = new mongoose.Schema({
    lote: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lote",
        required: [true, "lote es obligatorio"]
    },
    tecnico: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tecnico",
        required: [true, "tecnico es obligatorio"]
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    tipo: {
        type: String,
        required: [true, "tipo es obligatorio"],
        enum: {
            values: ["humedad", "suelo", "plaga", "clima", "otro"],
            message: "tipo debe ser humedad, suelo, plaga, clima u otro"
        }
    },
    descripcion: String
});

module.exports = mongoose.model("Observacion", observacionSchema, "observaciones");
