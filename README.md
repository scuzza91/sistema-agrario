# Sistema agrario - monitoreo de lotes

Segunda entrega de **Desarrollo Web Backend** (IFTS 29).

Aplicacion en Node.js y Express para registrar productores, tipos de cultivo, lotes, tecnicos y observaciones de campo. Los datos se guardan en **MongoDB** usando **Mongoose**.

## Requisitos

- Node.js 18 o superior
- MongoDB local (Community Server o Docker) o un cluster de MongoDB Atlas

## Como ejecutarlo

```bash
npm install
cp .env.example .env      # en Windows: copy .env.example .env
npm run seed              # carga los datos de ejemplo de data/ en MongoDB
npm start
```

El servidor queda en [http://localhost:3000](http://localhost:3000).

Variables de entorno (`.env`):

| Variable | Ejemplo |
| --- | --- |
| `PORT` | `3000` |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/sistema_agrario` |

Para usar Atlas, reemplazar `MONGODB_URI` por la cadena de conexion del cluster (`mongodb+srv://usuario:clave@cluster.../sistema_agrario`).

Con Docker se puede levantar un MongoDB local con:

```bash
docker run -d --name mongo-agrario -p 27017:27017 mongo:7
```

## Vistas (Pug)

- Inicio: `/`
- Productores: `/ver/productores`
- Tecnicos: `/ver/tecnicos`
- Tipos de cultivo: `/ver/tipos-cultivo`
- Lotes: `/ver/lotes`
- Observaciones: `/ver/observaciones`

Desde esas pantallas se pueden listar y dar de alta registros con un formulario simple.

## API (Postman / Thunder Client)

Listado de endpoints: `GET /api`

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/productores` | Listar |
| GET | `/productores/:id` | Buscar por id (ObjectId de MongoDB) |
| POST | `/productores` | Crear |
| PUT | `/productores/:id` | Actualizar |
| DELETE | `/productores/:id` | Eliminar |

Las mismas operaciones existen para `/tecnicos`, `/tipos-cultivo`, `/lotes` y `/observaciones`.

Filtros:

- `GET /lotes?productor=<id>`
- `GET /observaciones?lote=<id>&tecnico=<id>`

Los listados de lotes y observaciones usan `populate` para devolver el nombre del productor, cultivo, lote y tecnico.

Coleccion para importar: `postman/Sistema-Agrario.postman_collection.json`. Correrla en orden despues de `npm run seed`: los GET de listado guardan los `_id` en variables de la coleccion.

## Validaciones y errores

- Validaciones en los Schemas de Mongoose: campos obligatorios, `min`, `enum`, formato de CUIT (`match`) y `unique`.
- Los controladores verifican que existan las referencias (productor, tipo de cultivo, lote, tecnico).
- No se puede borrar un registro que tiene otros asociados (por ejemplo un productor con lotes).
- `middleware/errorHandler.js` centraliza los errores: 400 para validaciones, id invalido o duplicados; 404 para rutas o registros inexistentes; 500 para errores inesperados.

## Estructura

```
config/         conexion a MongoDB
models/         Schemas y modelos de Mongoose
routes/         rutas HTTP
controllers/    logica con async/await
views/          plantillas Pug
middleware/     logger, respuesta JSON o redirect y manejo de errores
data/           datos de ejemplo que carga seed.js
seed.js         carga inicial de la base
```

## Tecnologias

- Node.js
- Express
- MongoDB + Mongoose
- Pug
- dotenv
