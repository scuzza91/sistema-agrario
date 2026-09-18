const express = require("express");
const router = express.Router();

const {
    verProductores,
    verTecnicos,
    verTiposCultivo,
    verLotes,
    verObservaciones
} = require("../controllers/vistasController");

router.get("/productores", verProductores);
router.get("/tecnicos", verTecnicos);
router.get("/tipos-cultivo", verTiposCultivo);
router.get("/lotes", verLotes);
router.get("/observaciones", verObservaciones);

module.exports = router;
