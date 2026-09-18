const express = require("express");
const router = express.Router();

const {
    obtenerProductores,
    obtenerProductorPorId,
    crearProductor,
    actualizarProductor,
    eliminarProductor
} = require("../controllers/productoresController");

router.get("/", obtenerProductores);
router.get("/:id", obtenerProductorPorId);
router.post("/", crearProductor);
router.put("/:id", actualizarProductor);
router.delete("/:id", eliminarProductor);

module.exports = router;
