# 📊 Guía de Usuario - Crystal Reports Griver

## 🎯 Introducción

El Sistema de Reportes Crystal de Griver te permite generar informes profesionales sobre cursos, empleados y el desempeño general del sistema. Esta guía te enseñará cómo usar todas las funcionalidades disponibles.

---

## 🔐 Acceso al Sistema

### **Roles con Acceso**

- **Administrador**: Acceso completo a todos los reportes
- **RH**: Acceso a la mayoría de reportes excepto "Desempeño General del Sistema"
- **Empleados/Becarios**: Sin acceso (vista de cliente diferente)

### **Cómo Acceder**

1. Inicia sesión en el Sistema Griver
2. En el menú lateral, haz clic en **"Reportes Crystal"**
3. Verás la pantalla principal con tarjetas de reportes disponibles

---

## 📑 Tipos de Reportes Disponibles

### **1. Progreso de Empleados por Curso**

**¿Qué muestra?**
- Lista detallada de cada empleado y su avance en cursos asignados
- Progreso en porcentaje
- Estado actual (Completado, En Progreso, Atrasado, No Iniciado)
- Fechas de asignación y completación
- Días transcurridos desde la asignación

**¿Cuándo usarlo?**
- Para seguimiento individual de empleados
- Identificar quién necesita apoyo
- Verificar cumplimiento de capacitaciones
- Reportes mensuales de progreso

**Filtros disponibles:**
- ✅ Rango de fechas
- ✅ Departamentos específicos
- ✅ Cursos específicos
- ✅ Rango de progreso (0-100%)

---

### **2. Estadísticas por Departamento**

**¿Qué muestra?**
- Comparación entre departamentos
- Total de empleados por departamento
- Cursos asignados vs completados
- Tasa de completación
- Progreso promedio
- Completación a tiempo

**¿Cuándo usarlo?**
- Comparar desempeño entre áreas
- Identificar departamentos que necesitan apoyo
- Reportes ejecutivos trimestrales
- Análisis de recursos por área

**Filtros disponibles:**
- ✅ Rango de fechas
- ✅ Departamentos específicos

---

### **3. Reporte de Certificaciones**

**¿Qué muestra?**
- Certificados emitidos a empleados
- Fecha de emisión y validez
- Calificación obtenida
- Estado del certificado (Vigente, Próximo a Vencer, Vencido)
- ID único de cada certificado

**¿Cuándo usarlo?**
- Auditorías de certificaciones
- Renovación de certificados próximos a vencer
- Validación de cumplimiento regulatorio
- Reportes de compliance

**Filtros disponibles:**
- ✅ Rango de fechas
- ✅ Cursos específicos
- ✅ Estado de certificación

---

### **4. Asignaciones Pendientes**

**¿Qué muestra?**
- Cursos asignados pero no completados
- Prioridad (Crítica, Alta, Media, Baja)
- Días restantes hasta fecha límite
- Progreso actual
- Empleados con mayor riesgo de incumplimiento

**¿Cuándo usarlo?**
- Enviar recordatorios a empleados
- Planificar recursos de capacitación
- Prevenir incumplimientos
- Reportes semanales de seguimiento

**Filtros disponibles:**
- ✅ Rango de fechas
- ✅ Departamentos específicos
- ✅ Cursos específicos
- ✅ Nivel de prioridad

---

### **5. Desempeño General del Sistema** ⭐ *Solo Admin*

**¿Qué muestra?**
- KPIs globales del sistema Griver
- Total de empleados activos
- Tasa de completación global
- Promedio de progreso general
- Comparación con períodos anteriores
- Logro vs objetivos establecidos

**¿Cuándo usarlo?**
- Reportes ejecutivos para dirección
- Evaluación de ROI del sistema
- Planificación estratégica
- Presentaciones a stakeholders

**Filtros disponibles:**
- ✅ Rango de fechas

---

### **6. Histórico de Completación**

**¿Qué muestra?**
- Timeline de cursos completados
- Duración promedio de completación
- Calificaciones obtenidas
- Número de intentos
- Certificados emitidos

**¿Cuándo usarlo?**
- Análisis de tendencias temporales
- Identificar mejores prácticas
- Evaluar dificultad de cursos
- Reportes anuales

**Filtros disponibles:**
- ✅ Rango de fechas
- ✅ Departamentos específicos
- ✅ Cursos específicos

---

## 🎨 Cómo Generar un Reporte

### **Paso 1: Seleccionar Tipo de Reporte**

1. En la pantalla principal, verás tarjetas con cada tipo de reporte
2. Lee la descripción para elegir el reporte adecuado
3. Haz clic en el botón **"Generar"** de la tarjeta deseada

### **Paso 2: Configurar Filtros**

1. Se abrirá una ventana de configuración
2. **Rango de Fechas**: Selecciona el período
   - Hoy
   - Esta Semana
   - Este Mes
   - Mes Anterior
   - Este Trimestre
   - Este Año
   - Personalizado (selecciona fechas específicas)

3. **Departamentos** (opcional):
   - Marca las casillas de los departamentos que quieres incluir
   - Deja todo sin marcar para incluir todos

4. **Cursos** (opcional):
   - Selecciona un curso específico del dropdown
   - Deja en "Todos los cursos" para no filtrar

5. **Configuración PDF** (opcional):
   - Haz clic en "Configuración PDF" para personalizar:
     - Tamaño de página (Carta, A4, Legal)
     - Orientación (Vertical, Horizontal)
     - Incluir/excluir logo de Griver
     - Incluir/excluir encabezado y pie de página
     - Numeración de páginas
     - Marca de agua (ej: "CONFIDENCIAL")

### **Paso 3: Generar**

1. Revisa que los filtros sean correctos
2. Haz clic en **"Generar Reporte"**
3. Espera unos segundos mientras se procesa
4. Verás un mensaje de éxito con el número de registros encontrados

### **Paso 4: Vista Previa**

1. Se abrirá automáticamente la vista previa del reporte
2. Verás:
   - **Resumen**: Estadísticas clave en la parte superior
   - **Tabla de Datos**: Todos los registros con scroll
   - **Botones de Exportación**: En la parte superior

3. Revisa que los datos sean correctos

---

## 💾 Exportar Reportes

### **Formato PDF** 📄

**¿Cuándo usar?**
- Para compartir con directivos
- Archivar en expedientes
- Enviar por email
- Imprimir físicamente

**Cómo exportar:**
1. En la vista previa, haz clic en **"Exportar PDF"**
2. El archivo se descargará automáticamente
3. Nombre del archivo: `[Nombre del Reporte]_[Fecha].pdf`

**Características:**
- ✅ Logo de Griver incluido
- ✅ Encabezado con título y filtros
- ✅ Pie de página con fecha y número de página
- ✅ Formato profesional listo para imprimir
- ✅ Marca de agua opcional

---

### **Formato Excel** 📊

**¿Cuándo usar?**
- Para análisis adicional con fórmulas
- Crear gráficos personalizados
- Combinar con otros datos
- Manipular información

**Cómo exportar:**
1. En la vista previa, haz clic en **"Exportar Excel"**
2. El archivo `.xlsx` se descargará
3. Abre con Microsoft Excel o Google Sheets

**Características:**
- ✅ Todas las columnas del reporte
- ✅ Formato de tabla
- ✅ Ancho de columnas automático
- ✅ Compatible con Excel 2010+

---

### **Formato CSV** 📝

**¿Cuándo usar?**
- Para importar a otros sistemas
- Bases de datos
- Análisis con Python/R
- Máxima compatibilidad

**Cómo exportar:**
1. En la vista previa, haz clic en **"Exportar CSV"**
2. El archivo `.csv` se descargará
3. Abre con Excel, Google Sheets, o editor de texto

**Características:**
- ✅ Formato de texto plano
- ✅ Compatible con todos los sistemas
- ✅ Ligero y rápido

---

### **Imprimir Directamente** 🖨️

**Cómo imprimir:**
1. En la vista previa, haz clic en **"Imprimir"**
2. Se abrirá la ventana de impresión del navegador
3. Selecciona tu impresora
4. Configura opciones (copias, páginas, etc.)
5. Haz clic en "Imprimir"

**Tip:** El formato está optimizado para impresión en papel Carta

---

## 🎯 Casos de Uso Comunes

### **Caso 1: Reporte Mensual para Gerencia**

**Objetivo:** Presentar avance mensual del programa de capacitación

**Pasos:**
1. Generar **"Estadísticas por Departamento"**
2. Filtro: "Este Mes"
3. Exportar a PDF
4. Generar **"Desempeño General del Sistema"**
5. Filtro: "Este Mes"
6. Exportar a PDF
7. Combinar ambos PDFs para presentación

---

### **Caso 2: Identificar Empleados Rezagados**

**Objetivo:** Encontrar quién necesita apoyo urgente

**Pasos:**
1. Generar **"Asignaciones Pendientes"**
2. Filtro: "Este Mes"
3. Revisar empleados con prioridad "Crítica" o "Alta"
4. Exportar a Excel
5. Enviar recordatorios personalizados

---

### **Caso 3: Auditoría de Certificaciones**

**Objetivo:** Preparar documentación para auditoría externa

**Pasos:**
1. Generar **"Reporte de Certificaciones"**
2. Filtro: "Este Año"
3. Configurar PDF con:
   - Marca de agua: "AUDITORÍA 2025"
   - Logo incluido
   - Pie de página con fecha
4. Exportar a PDF
5. Archivar como evidencia

---

### **Caso 4: Planificar Recursos del Siguiente Trimestre**

**Objetivo:** Determinar qué departamentos necesitan más recursos

**Pasos:**
1. Generar **"Estadísticas por Departamento"**
2. Filtro: "Este Trimestre"
3. Exportar a Excel
4. Analizar tasas de completación bajas
5. Generar **"Asignaciones Pendientes"**
6. Filtro: Departamentos identificados
7. Planificar asignación de instructores

---

## ⚡ Tips y Mejores Prácticas

### **Filtros Efectivos**

✅ **DO:**
- Usa rangos de fechas específicos para datos más relevantes
- Filtra por departamento si solo necesitas un área
- Exporta a Excel si vas a manipular los datos
- Usa PDF para documentos oficiales

❌ **DON'T:**
- No uses "Todos" los filtros si solo necesitas datos específicos
- No exportes archivos muy grandes a CSV (usa Excel)
- No olvides configurar el PDF antes de exportar

---

### **Frecuencia Recomendada**

| Reporte | Frecuencia Sugerida |
|---------|---------------------|
| Progreso de Empleados | Semanal |
| Estadísticas por Departamento | Mensual |
| Certificaciones | Trimestral |
| Asignaciones Pendientes | Semanal |
| Desempeño del Sistema | Mensual |
| Histórico de Completación | Anual |

---

### **Seguridad y Confidencialidad**

🔒 **Importante:**
- Los reportes pueden contener información sensible
- Usa marca de agua "CONFIDENCIAL" para documentos internos
- No compartas PDFs con personas fuera de Griver
- Los reportes se generan en tiempo real (no se almacenan)

---

## ❓ Preguntas Frecuentes (FAQ)

### **¿Cuánto tiempo tarda en generar un reporte?**
Normalmente 1-3 segundos. Reportes muy grandes pueden tardar hasta 10 segundos.

### **¿Cuál es el límite de registros?**
No hay límite, pero recomendamos usar filtros para reportes más manejables.

### **¿Puedo programar reportes automáticos?**
En la versión actual no, pero está en desarrollo para próximas versiones.

### **¿Los datos son en tiempo real?**
Sí, cada vez que generas un reporte se consultan los datos más recientes.

### **¿Puedo editar un reporte después de generarlo?**
No directamente, pero puedes exportar a Excel y modificarlo allí.

### **¿Se guardan mis reportes generados?**
No se almacenan automáticamente. Debes exportarlos si quieres conservarlos.

### **¿Por qué no veo todos los tipos de reportes?**
Depende de tu rol. Solo administradores ven todos los reportes.

### **¿Puedo crear reportes personalizados?**
En la versión actual hay 6 tipos fijos. Reportes personalizados vendrán en v2.0.

---

## 🆘 Solución de Problemas

### **El reporte no se genera**

**Posibles causas:**
- Sin conexión a internet
- Filtros muy restrictivos (0 resultados)
- Error temporal del sistema

**Solución:**
1. Verifica tu conexión
2. Amplía los filtros
3. Recarga la página e intenta nuevamente
4. Contacta a soporte si persiste

---

### **El PDF se ve diferente al esperado**

**Solución:**
1. Verifica la configuración PDF antes de exportar
2. Asegúrate de tener Adobe Reader actualizado
3. Prueba con otro visualizador de PDF

---

### **El archivo Excel no abre**

**Solución:**
1. Asegúrate de tener Microsoft Excel 2010 o superior
2. Prueba con Google Sheets
3. Verifica que el archivo se descargó completamente

---

## 📞 Soporte

**¿Necesitas ayuda?**

📧 Email: soporte@griver.com  
📱 Teléfono: (55) 1234-5678  
⏰ Horario: Lunes a Viernes, 9:00 AM - 6:00 PM

**Incluye en tu solicitud:**
- Tipo de reporte que intentas generar
- Filtros aplicados
- Captura de pantalla del error (si aplica)
- Tu nombre y departamento

---

## 🎓 Recursos Adicionales

- **Video Tutorial**: [Cómo usar Crystal Reports](https://griver.com/videos/crystal-reports)
- **Webinar Mensual**: Cada primer martes del mes, 10:00 AM
- **Base de Conocimiento**: [https://help.griver.com/reports](https://help.griver.com/reports)

---

**Versión de la Guía:** 1.0.0  
**Última Actualización:** Enero 10, 2025  
**Próxima Revisión:** Marzo 2025
