# -*- coding: utf-8 -*-
"""Genera el documento de entrega a partir de la plantilla de la cátedra."""

import json
import os
import shutil
import urllib.error
import urllib.request

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

BASE = "http://localhost:3000"
ROOT = os.path.dirname(os.path.abspath(__file__))
PROYECTO = os.path.dirname(ROOT)
SALIDA = os.path.join(os.path.dirname(PROYECTO), "DSWB_2X_MonitoreoLotes_1C26.docx")
LOGO = os.path.join(
    os.environ.get("TEMP", ""),
    "tp-entrega-docx",
    "word",
    "media",
    "image1.png",
)
LOGO_LOCAL = os.path.join(ROOT, "ifts29.png")
CAPTURAS = [
    os.path.join(ROOT, "capturas-pruebas.png"),
    os.path.join(ROOT, "captura-404.png"),
    os.path.join(ROOT, "captura-errores.png"),
    os.path.join(ROOT, "vista-productores-pug.png"),
]


def pedir(metodo, ruta, cuerpo=None):
    data = None
    headers = {}
    if cuerpo is not None:
        data = json.dumps(cuerpo).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(BASE + ruta, data=data, headers=headers, method=metodo)
    try:
        with urllib.request.urlopen(req) as resp:
            bruto = resp.read().decode("utf-8")
            try:
                parsed = json.loads(bruto)
            except json.JSONDecodeError:
                parsed = bruto
            return resp.status, parsed
    except urllib.error.HTTPError as err:
        bruto = err.read().decode("utf-8")
        try:
            parsed = json.loads(bruto)
        except json.JSONDecodeError:
            parsed = bruto
        return err.code, parsed


def set_run_font(run, name="Calibri", size=11, bold=False, color=None):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    run.bold = bold
    if color:
        run.font.color.rgb = RGBColor(*color)


def add_heading_custom(doc, text, size=16):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(8)
    run = p.add_run(text)
    set_run_font(run, "Calibri", size, True, (0x1F, 0x4E, 0x79))
    return p


def add_body(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    set_run_font(run, "Calibri", 11)
    return p


def add_bullet(doc, text):
    p = doc.add_paragraph(style="List Bullet")
    p.clear()
    run = p.add_run(text)
    set_run_font(run, "Calibri", 11)
    return p


def shade_cell(cell, hex_color):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), hex_color)
    shd.set(qn("w:val"), "clear")
    tcPr.append(shd)


def set_cell_text(cell, text, bold=False, color=None, size=10):
    cell.text = ""
    p = cell.paragraphs[0]
    run = p.add_run(text)
    set_run_font(run, "Calibri", size, bold, color)


def add_footer(section, texto):
    footer = section.footer
    footer.is_linked_to_previous = False
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(texto)
    set_run_font(run, "Calibri", 9, False, (0xA6, 0xA6, 0xA6))


def add_page_number(paragraph):
    run = paragraph.add_run(" | Pagina ")
    set_run_font(run, "Calibri", 9, False, (0xA6, 0xA6, 0xA6))
    fld1 = OxmlElement("w:fldChar")
    fld1.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    fld2 = OxmlElement("w:fldChar")
    fld2.set(qn("w:fldCharType"), "end")
    r = paragraph.add_run()
    r._r.append(fld1)
    r._r.append(instr)
    r._r.append(fld2)


def tabla(doc, encabezados, filas):
    table = doc.add_table(rows=1, cols=len(encabezados))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(encabezados):
        set_cell_text(table.rows[0].cells[i], h, True, (255, 255, 255), 10)
        shade_cell(table.rows[0].cells[i], "1F4E79")
    for fila in filas:
        row = table.add_row()
        for i, valor in enumerate(fila):
            set_cell_text(row.cells[i], str(valor), False, None, 10)
    doc.add_paragraph()
    return table


def main():
    pruebas = [
        ("GET", "/api", None, "Listado de endpoints"),
        ("GET", "/productores", None, "Listar productores"),
        ("GET", "/productores/1", None, "Buscar productor por id"),
        ("GET", "/productores/999", None, "Productor inexistente"),
        ("GET", "/lotes?productorId=1", None, "Filtrar lotes por productor"),
        ("GET", "/tecnicos", None, "Listar tecnicos"),
        ("GET", "/tipos-cultivo", None, "Listar tipos de cultivo"),
        ("GET", "/observaciones?loteId=1", None, "Filtrar observaciones por lote"),
        (
            "POST",
            "/lotes",
            {
                "nombre": "Lote Error",
                "hectareas": 10,
                "productorId": 999,
                "tipoCultivoId": 1,
            },
            "Alta de lote con productor inexistente",
        ),
        ("DELETE", "/productores/1", None, "Baja de productor con lotes asociados"),
        (
            "POST",
            "/observaciones",
            {
                "loteId": 3,
                "tecnicoId": 2,
                "tipo": "clima",
                "descripcion": "Helada leve. Evaluar dano en trigo",
            },
            "Alta de observacion",
        ),
    ]

    resultados = []
    for metodo, ruta, cuerpo, titulo in pruebas:
        status, body = pedir(metodo, ruta, cuerpo)
        resultados.append(
            {
                "titulo": titulo,
                "metodo": metodo,
                "ruta": ruta,
                "status": status,
                "body": body,
            }
        )

    # dejar los JSON de ejemplo como estaban (sin la observacion de prueba)
    obs_path = os.path.join(PROYECTO, "data", "observaciones.json")
    with open(obs_path, "r", encoding="utf-8") as f:
        observaciones = json.load(f)
    observaciones = [o for o in observaciones if o.get("descripcion") != "Helada leve. Evaluar dano en trigo"]
    with open(obs_path, "w", encoding="utf-8") as f:
        json.dump(observaciones, f, ensure_ascii=False, indent=2)
        f.write("\n")

    os.makedirs(ROOT, exist_ok=True)
    if os.path.exists(LOGO) and not os.path.exists(LOGO_LOCAL):
        shutil.copy(LOGO, LOGO_LOCAL)

    html_rows = []
    for r in resultados:
        pretty = json.dumps(r["body"], ensure_ascii=False, indent=2)
        ok = r["status"] in (200, 201, 400, 404)
        badge = "ok" if ok else "fail"
        html_rows.append(
            f"""
            <article class="card">
              <div class="meta">
                <span class="method {r['metodo']}">{r['metodo']}</span>
                <code>{r['ruta']}</code>
                <span class="status {badge}">{r['status']}</span>
              </div>
              <h3>{r['titulo']}</h3>
              <pre>{pretty}</pre>
            </article>
            """
        )

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Pruebas funcionales - Sistema agrario</title>
  <style>
    body {{ font-family: Calibri, Arial, sans-serif; background: #f4f6f8; margin: 24px; color: #1b1b1b; }}
    h1 {{ color: #1F4E79; }}
    .card {{ background: #fff; border: 1px solid #d0d7de; border-radius: 8px; padding: 16px; margin-bottom: 16px; }}
    .meta {{ display: flex; gap: 12px; align-items: center; margin-bottom: 8px; }}
    code {{ background: #eef2f6; padding: 4px 8px; border-radius: 4px; }}
    pre {{ background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 6px; overflow: auto; font-size: 13px; }}
    .method {{ color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold; }}
    .GET {{ background: #1d4ed8; }}
    .POST {{ background: #15803d; }}
    .DELETE {{ background: #b91c1c; }}
    .status.ok {{ color: #15803d; font-weight: bold; }}
    .status.fail {{ color: #b91c1c; font-weight: bold; }}
  </style>
</head>
<body>
  <h1>Registro de pruebas funcionales</h1>
  <p>Sistema agrario - monitoreo de lotes | http://localhost:3000</p>
  {''.join(html_rows)}
</body>
</html>
"""
    html_path = os.path.join(ROOT, "pruebas.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

    doc = Document()
    section = doc.sections[0]
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.left_margin = Cm(2)
    section.right_margin = Cm(2)
    section.top_margin = Cm(1.8)
    section.bottom_margin = Cm(2)
    add_footer(
        section,
        "DSWB_2X_MonitoreoLotes_2C26 | Tecnicatura Superior en Desarrollo de Software - IFTS 29",
    )
    add_page_number(section.footer.paragraphs[0])

    if os.path.exists(LOGO_LOCAL):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.add_run().add_picture(LOGO_LOCAL, width=Cm(3.2))

    t = doc.add_paragraph()
    t.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = t.add_run("DOCUMENTACION - Parte 1")
    set_run_font(r, "Calibri", 22, True, (0x1F, 0x4E, 0x79))

    sub = doc.add_paragraph()
    sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = sub.add_run("Desarrollo de Sistemas Web Backend - Primera entrega")
    set_run_font(r, "Calibri", 12, False, (0x5B, 0x5B, 0x5B))

    add_body(doc, "Caso: Monitoreo de lotes (empresa agricola).")
    add_body(doc, "Empresa de desarrollo: completar nombre del grupo.")
    add_body(doc, "Nombre del documento y de la carpeta Drive: DSWB_2X_MonitoreoLotes_1C26")
    add_body(
        doc,
        "Reemplazar 2X por el numero de grupo. La consigna escrita usa 1C26; si el aula o el docente indico 2C26, usar esa nomenclatura.",
    )

    add_heading_custom(doc, "Indice", 16)
    for item in [
        "1. Links",
        "2. Bibliografia",
        "3. Introduccion",
        "4. Integrantes y responsabilidades",
        "5. Descripcion funcional de la aplicacion",
        "5.1. Objetivo general",
        "5.2. Funcionalidades principales actuales",
        "6. Modulos del proyecto",
        "7. Persistencia de datos",
        "8. Pruebas funcionales",
        "9. Uso de inteligencia artificial",
    ]:
        add_body(doc, item)

    add_heading_custom(doc, "1. Links", 16)
    add_body(doc, "Carpeta de Drive: completar (compartir como editor al mail de la materia).")
    add_body(doc, "GitHub: completar.")
    add_body(doc, "Link al video de defensa: completar.")
    add_body(
        doc,
        "El codigo de esta entrega esta en la carpeta sistema-agrario. No incluir node_modules en Drive ni en GitHub.",
    )

    add_heading_custom(doc, "2. Bibliografia", 16)
    add_body(doc, "Videos (YouTube): no se utilizaron tutoriales externos para esta instancia.")
    add_body(doc, "Documentos y referencias:")
    add_bullet(doc, "Material de catedra: mapa de contenidos y carpeta Code de las clases 1 a 4.")
    add_bullet(doc, "Documentacion de Express.js. https://expressjs.com/es/starter/hello-world.html")
    add_bullet(doc, "Documentacion de Node.js, modulo fs. https://nodejs.org/api/fs.html")
    add_bullet(doc, "Documentacion de Node.js, modulo path. https://nodejs.org/api/path.html")
    add_bullet(doc, "Postman Learning Center. https://learning.postman.com/docs/getting-started/introduction/")

    add_heading_custom(doc, "3. Introduccion", 16)
    add_body(
        doc,
        "En esta primera entrega se desarrollo el backend de un sistema de monitoreo de lotes agricolas. "
        "El trabajo sigue el recorte pedido por la catedra: una version reducida del caso, "
        "sin login, sin despliegue y sin base de datos MongoDB.",
    )
    add_body(
        doc,
        "Se implemento una aplicacion con Node.js y Express, organizada con el patron modelo-vista-controlador. "
        "Los datos se guardan en archivos JSON planos, con lectura y escritura sincronica. "
        "Las clases de models aplican programacion orientada a objetos. "
        "Hay rutas dinamicas (/productores/:id), middleware propio de registro de peticiones, "
        "express.json, express.urlencoded y motor de plantillas Pug para cargar datos desde un formulario simple.",
    )
    add_body(
        doc,
        "La parte visual no se profundizo porque la evaluacion de esta instancia se centra en el funcionamiento "
        "del backend y en las pruebas con Postman o Thunder Client. Las rutas se prueban por HTTP y responden JSON.",
    )

    add_heading_custom(doc, "4. Integrantes y responsabilidades", 16)
    add_body(
        doc,
        "Completar apellido y nombre de cada integrante. La division propuesta para esta entrega es la siguiente:",
    )
    tabla(
        doc,
        ["Integrante", "Responsabilidad en esta entrega"],
        [
            ["Completar", "Modulo Productores: modelo, rutas, controlador y archivo productores.json"],
            ["Completar", "Modulo Lotes y Tipos de cultivo: altas, filtros y validacion de relaciones"],
            ["Completar", "Modulo Tecnicos y Observaciones: registro de campo y reglas de baja"],
            ["Completar", "Documentacion, repositorio, Drive y pruebas en Postman / Thunder Client"],
        ],
    )
    add_body(
        doc,
        "Si el grupo tiene otra cantidad de integrantes, redistribuir las filas sin dejar de cubrir los cinco modulos.",
    )

    add_heading_custom(doc, "5. Descripcion funcional de la aplicacion", 16)
    add_heading_custom(doc, "5.1. Objetivo general", 13)
    add_body(
        doc,
        "Permitir a una empresa agricola registrar productores, lotes, tipos de cultivo, tecnicos y observaciones "
        "de campo, consultando y actualizando esa informacion desde una API REST con persistencia local en JSON.",
    )

    add_heading_custom(doc, "5.2. Funcionalidades principales actuales", 13)
    add_bullet(doc, "ABMC de productores, tecnicos, tipos de cultivo, lotes y observaciones.")
    add_bullet(doc, "Consulta de un registro puntual por id, con respuesta 404 si no existe.")
    add_bullet(doc, "Filtro de lotes por productor y de observaciones por lote o tecnico.")
    add_bullet(doc, "Validacion de relaciones: un lote debe referenciar un productor y un cultivo existentes.")
    add_bullet(doc, "Una observacion debe referenciar un lote y un tecnico existentes.")
    add_bullet(
        doc,
        "Baja controlada: no se elimina un productor, tecnico, lote o cultivo si tiene datos asociados.",
    )
    add_bullet(doc, "Vistas Pug en / y /ver/productores, /ver/tecnicos, /ver/tipos-cultivo, /ver/lotes y /ver/observaciones.")
    add_bullet(doc, "Formularios simples para dar de alta registros desde el navegador.")
    add_bullet(doc, "Middleware logger que muestra en consola cada metodo y ruta.")
    add_bullet(doc, "Clases en models (Productor, Tecnico, TipoCultivo, Lote, Observacion).")
    add_bullet(doc, "Rutas dinamicas por id: GET, PUT y DELETE /recurso/:id.")

    add_heading_custom(doc, "6. Modulos del proyecto", 16)
    add_body(doc, "Modulo de Productores")
    add_bullet(doc, "Listar, crear, editar y eliminar productores.")
    add_bullet(doc, "Ver un productor por id.")
    add_bullet(doc, "Impide borrar un productor que todavia tiene lotes.")

    add_body(doc, "Modulo de Tipos de cultivo")
    add_bullet(doc, "Catalogo de cultivos (soja, maiz, trigo, etc.).")
    add_bullet(doc, "Listar, crear, editar y eliminar tipos de cultivo.")
    add_bullet(doc, "No se borra un cultivo si esta asignado a un lote.")

    add_body(doc, "Modulo de Lotes")
    add_bullet(doc, "Listar, crear, editar y eliminar lotes.")
    add_bullet(doc, "Asociar cada lote a un productor y a un tipo de cultivo.")
    add_bullet(doc, "Filtrar lotes por productorId.")
    add_bullet(doc, "Controlar hectareas mayores a 0 y estado del lote.")

    add_body(doc, "Modulo de Tecnicos")
    add_bullet(doc, "Listar, crear, editar y eliminar tecnicos de campo.")
    add_bullet(doc, "No se borra un tecnico que cargo observaciones.")

    add_body(doc, "Modulo de Observaciones")
    add_bullet(doc, "Registrar observaciones de humedad, suelo, plaga o clima sobre un lote.")
    add_bullet(doc, "Filtrar por loteId o tecnicoId.")
    add_bullet(doc, "Es el modulo que relaciona el trabajo de campo con el lote monitoreado.")

    add_heading_custom(doc, "Proximos modulos", 13)
    add_bullet(doc, "Pasar la persistencia de JSON plano a MongoDB, primero en local y despues en la nube.")
    add_bullet(doc, "Agregar plantillas Pug para cargar datos desde un formulario simple.")
    add_bullet(doc, "Validaciones y manejo de errores con middleware.")
    add_bullet(doc, "Login, roles y seguridad, previstos para etapas posteriores.")
    add_bullet(doc, "Uso de un modulo de inteligencia artificial (Gemini) sobre la informacion cargada.")

    add_heading_custom(doc, "7. Persistencia de datos", 16)
    add_body(
        doc,
        "Los datos se almacenan en archivos JSON dentro de la carpeta data/. La lectura y la escritura "
        "se hacen de forma sincronica con fs.readFileSync y fs.writeFileSync, como en el ejemplo de clase.",
    )
    add_bullet(doc, "data/productores.json")
    add_bullet(doc, "data/tecnicos.json")
    add_bullet(doc, "data/tiposCultivo.json")
    add_bullet(doc, "data/lotes.json")
    add_bullet(doc, "data/observaciones.json")
    add_body(
        doc,
        "La organizacion del codigo es: index.js crea el servidor y monta las rutas; routes define los "
        "endpoints; controllers resuelve la logica y el acceso al archivo; models contiene las clases.",
    )
    add_body(doc, "Para iniciar el servidor:")
    add_body(doc, "cd sistema-agrario")
    add_body(doc, "npm install")
    add_body(doc, "npm start")
    add_body(doc, "El servidor queda en http://localhost:3000")

    add_heading_custom(doc, "8. Pruebas funcionales", 16)
    add_body(
        doc,
        "Se probaron las rutas JSON con la API en local. La coleccion para Postman o Thunder Client esta en "
        "sistema-agrario/postman/Sistema-Agrario.postman_collection.json. "
        "Importarla en Thunder Client, ejecutar Send y pegar al menos una captura, que es lo minimo pedido por la consigna.",
    )
    add_body(doc, "Resumen de pruebas ejecutadas sobre http://localhost:3000:")

    filas_prueba = []
    for r in resultados:
        filas_prueba.append([r["metodo"], r["ruta"], str(r["status"]), r["titulo"]])
    tabla(doc, ["Metodo", "Ruta", "Status", "Resultado esperado"], filas_prueba)

    add_body(doc, "Detalle de respuestas obtenidas:")
    for r in resultados:
        p = doc.add_paragraph()
        run = p.add_run(f"{r['metodo']} {r['ruta']}  ->  {r['status']}  ({r['titulo']})")
        set_run_font(run, "Calibri", 11, True)
        bloque = doc.add_paragraph()
        pretty = json.dumps(r["body"], ensure_ascii=False, indent=2)
        if len(pretty) > 900:
            pretty = pretty[:900] + "\n..."
        run = bloque.add_run(pretty)
        set_run_font(run, "Consolas", 9, False, (0x33, 0x33, 0x33))

    add_body(doc, "Registro visual de las pruebas ejecutadas sobre la API:")
    for imagen in CAPTURAS:
        if os.path.exists(imagen):
            doc.add_picture(imagen, width=Cm(16.2))
            doc.add_paragraph()

    add_body(
        doc,
        "Capturas de Postman / Thunder Client: pegar en esta seccion las pantallas de GET, POST, PUT y DELETE, "
        "incluyendo al menos un caso 200/201 y un caso de error 400 o 404.",
    )

    add_heading_custom(doc, "9. Uso de inteligencia artificial", 16)
    add_body(
        doc,
        "Se utilizo asistencia de IA para organizar la estructura MVC y revisar que el alcance coincidiera "
        "con lo visto en clase (CommonJS, JSON plano y fs sincrono). Prompts usados:",
    )
    add_bullet(
        doc,
        "Armar un CRUD de monitoreo de lotes con Express, CommonJS y persistencia en JSON, siguiendo el ejemplo de clase 4, con productores, lotes, tecnicos, observaciones y tipos de cultivo.",
    )
    add_bullet(
        doc,
        "Completar la plantilla de documentacion de la primera entrega de Backend con el caso agrario, sin agregar MongoDB, login ni ES Modules.",
    )
    add_body(
        doc,
        "El codigo se ajusto al estilo de la catedra: require/module.exports, comentarios minimos y respuestas en JSON.",
    )

    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    doc.save(SALIDA)
    copia = os.path.join(PROYECTO, "DSWB_2X_MonitoreoLotes_1C26.docx")
    shutil.copy(SALIDA, copia)
    print("HTML:", html_path)
    print("DOCX:", SALIDA)
    print("COPIA:", copia)


if __name__ == "__main__":
    main()
