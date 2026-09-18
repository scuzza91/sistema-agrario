const express = require("express");
const router = express.Router();

const {
    obtenerTecnicos,
    obtenerTecnicoPorId,
    crearTecnico,
    actualizarTecnico,
    eliminarTecnico
} = require("../controllers/tecnicosController");

router.get("/", obtenerTecnicos);
router.get("/:id", obtenerTecnicoPorId);
router.post("/", crearTecnico);
router.put("/:id", actualizarTecnico);
router.delete("/:id", eliminarTecnico);

module.exports = router;
