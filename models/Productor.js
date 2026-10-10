const mongoose = require("mongoose");

const productorSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "nombre es obligatorio"],
        trim: true
    },
    cuit: {
        type: String,
        required: [true, "cuit es obligatorio"],
        unique: true,
        match: [/^\d{2}-\d{8}-\d$/, "cuit debe tener el formato 00-00000000-0"]
    },
    localidad: String,
    telefono: String
});

module.exports = mongoose.model("Productor", productorSchema, "productores");
