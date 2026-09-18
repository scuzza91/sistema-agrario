const express = require("express");
const router = express.Router();

const {
    obtenerTiposCultivo,
    obtenerTipoCultivoPorId,
    crearTipoCultivo,
    actualizarTipoCultivo,
    eliminarTipoCultivo
} = require("../controllers/tiposCultivoController");

router.get("/", obtenerTiposCultivo);
router.get("/:id", obtenerTipoCultivoPorId);
router.post("/", crearTipoCultivo);
router.put("/:id", actualizarTipoCultivo);
router.delete("/:id", eliminarTipoCultivo);

module.exports = router;
