require("dotenv").config();

const path = require("path");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const conectarDB = require("./config/db");
const logger = require("./middleware/logger");
const { noEncontrado, manejarErrores } = require("./middleware/errorHandler");
const vistasRoutes = require("./routes/vistasRoutes");
const productoresRoutes = require("./routes/productoresRoutes");
const tecnicosRoutes = require("./routes/tecnicosRoutes");
const tiposCultivoRoutes = require("./routes/tiposCultivoRoutes");
const lotesRoutes = require("./routes/lotesRoutes");
const observacionesRoutes = require("./routes/observacionesRoutes");
const { verInicio } = require("./controllers/vistasController");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", verInicio);

app.get("/api", (req, res) => {
    res.json({
        mensaje: "Sistema agrario - monitoreo de lotes",
        vistas: "/ver/productores",
        endpoints: {
            productores: "/productores",
            tecnicos: "/tecnicos",
            tiposCultivo: "/tipos-cultivo",
            lotes: "/lotes",
            observaciones: "/observaciones"
        }
    });
});

app.use("/ver", vistasRoutes);
app.use("/productores", productoresRoutes);
app.use("/tecnicos", tecnicosRoutes);
app.use("/tipos-cultivo", tiposCultivoRoutes);
app.use("/lotes", lotesRoutes);
app.use("/observaciones", observacionesRoutes);

// Siempre al final: ruta inexistente y manejo de errores
app.use(noEncontrado);
app.use(manejarErrores);

const iniciar = async () => {
    await conectarDB();
    app.listen(PORT, () => {
        console.log("Servidor corriendo en http://localhost:" + PORT);
    });
};

iniciar();
