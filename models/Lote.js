class Lote {
    constructor(id, nombre, hectareas, productorId, tipoCultivoId, estado) {
        this.id = id;
        this.nombre = nombre;
        this.hectareas = hectareas;
        this.productorId = productorId;
        this.tipoCultivoId = tipoCultivoId;
        this.estado = estado;
    }
}

module.exports = Lote;
