# Sistema agrario - monitoreo de lotes

Primera entrega de **Desarrollo Web Backend** (IFTS 29).

Aplicacion en Node.js y Express para registrar productores, tipos de cultivo, lotes, tecnicos y observaciones de campo. Los datos se guardan en archivos JSON. No usa MongoDB.

## Como ejecutarlo

```bash
npm install
npm start
```

El servidor queda en [http://localhost:3000](http://localhost:3000).

Si el puerto 3000 esta ocupado, cerrar la otra ventana de Node y volver a ejecutar `npm start`.

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
| GET | `/productores/:id` | Buscar por id |
| POST | `/productores` | Crear |
| PUT | `/productores/:id` | Actualizar |
| DELETE | `/productores/:id` | Eliminar |

Las mismas operaciones existen para `/tecnicos`, `/tipos-cultivo`, `/lotes` y `/observaciones`.

Filtros:

- `GET /lotes?productorId=1`
- `GET /observaciones?loteId=1`

Coleccion para importar: `postman/Sistema-Agrario.postman_collection.json`

## Estructura

```
models/         clases (POO)
routes/         rutas HTTP
controllers/    logica y persistencia JSON
views/          plantillas Pug
middleware/     logger y respuesta JSON o redirect
data/           archivos JSON
```

## Tecnologias

- Node.js
- Express
- Pug
- Persistencia en JSON (`fs` sincrono)
