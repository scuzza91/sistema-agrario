class Observacion {
    constructor(id, loteId, tecnicoId, fecha, tipo, descripcion) {
        this.id = id;
        this.loteId = loteId;
        this.tecnicoId = tecnicoId;
        this.fecha = fecha;
        this.tipo = tipo;
        this.descripcion = descripcion;
    }
}

module.exports = Observacion;
