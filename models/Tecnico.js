const mongoose = require("mongoose");

const tecnicoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "nombre es obligatorio"],
        trim: true
    },
    apellido: {
        type: String,
        required: [true, "apellido es obligatorio"],
        trim: true
    },
    especialidad: String,
    matricula: String
});

module.exports = mongoose.model("Tecnico", tecnicoSchema, "tecnicos");
