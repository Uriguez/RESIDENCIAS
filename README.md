# 🚀 Sistema de Capacitación Digital GRIVER

![Badge de Estado](https://img.shields.io/badge/Estado-Desarrollo%20Activo-blue)
![Badge de Tecnología](https://img.shields.io/badge/Backend-ASP.NET%20Core%206%2B-purple)
![Badge de BD](https://img.shields.io/badge/Base%20de%20Datos-SQL%20Server-red)

## 📖 Descripción del Proyecto

[cite_start]Este proyecto es una solución web integral diseñada para la **Gestión Centralizada de Contenidos de Capacitación Digital** para los empleados de Tecnología y Comercio Exterior de México (TCEM), parte de Grupo GRIVER[cite: 178, 179].

[cite_start]El objetivo principal es sustituir los métodos de capacitación tradicionales (videos y carpetas compartidas [cite: 209][cite_start]) por una plataforma digital, garantizando la estandarización del conocimiento, la accesibilidad en tiempo real y el seguimiento detallado del progreso[cite: 177, 180, 237].

## ⚙️ Tecnologías (Tech Stack)

La aplicación está construida sobre una arquitectura moderna de la suite de Microsoft y herramientas de desarrollo ágil:

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Backend (API)** | **C# / ASP.NET Core Web API** | [cite_start]Lógica de negocio y servicios RESTful[cite: 694]. |
| **Acceso a Datos** | **Entity Framework Core (EF Core)** | Mapeo Objeto-Relacional (ORM) para interactuar con SQL Server. |
| **Base de Datos** | **SQL Server** | Almacenamiento estructurado de usuarios, cursos y progreso. |
| **Generación de PDF** | **Playwright (.NET)** | Renderizado de plantillas HTML/CSS a **Certificados PDF** de alta fidelidad. |
| **Testing** | **xUnit, FluentAssertions, Moq** | [cite_start]Pruebas unitarias y de integración[cite: 744, 752, 761]. |
| **Diseño UI/UX** | **Figma, HTML5, CSS** | [cite_start]Prototipado y definición de la interfaz web[cite: 507, 532]. |

## ✨ Características y Funcionalidades Clave

[cite_start]El sistema soporta múltiples perfiles de usuario, reflejando los Casos de Uso definidos en el diseño [cite: 1153-1162]:

| Actor | Funcionalidades Soportadas | Tablas Base |
| :--- | :--- | :--- |
| **Administrador** | [cite_start]**Gestión total de usuarios/roles, creación de cursos, subida de contenidos** (videos, documentos, exámenes)[cite: 1154]. | `Users`, `Courses`, `CourseContents`, `SystemSettings`. |
| **RR.HH.** | [cite_start]**Asignación masiva/individual de cursos**, supervisión de progreso por departamento, **revocación de certificados**[cite: 1156, 1157]. | `UserCourses`, `Progress`, `Certificates`. |
| **Empleado/Trainee** | [cite_start]Acceso a cursos asignados, realización de evaluaciones, consulta de **progreso personal**, **descarga de certificados PDF**[cite: 1160]. | `Progress`, `Certificates`. |
| **Auditoría** | [cite_start]Registro de `Activities` del sistema y errores para trazabilidad[cite: 984]. | `Activities`, `Notifications`. |

## 📐 Arquitectura de la Solución

El proyecto sigue una arquitectura por capas separadas dentro de una sola Solución de Visual Studio:

1.  **`SistemaCapacitacion.WebAPI`**: Capa de presentación y servicios (Controladores y configuración de API).
2.  **`SistemaCapacitacion.Core`**: Entidades y modelos de negocio (POCOs, enums).
3.  **`SistemaCapacitacion.Infrastructure`**: Capa de datos y persistencia (DbContext, Entity Framework Core).

## 🚀 Instalación y Configuración

Sigue estos pasos para levantar el proyecto en tu entorno de desarrollo.

### 1. Requisitos Previos

* **Visual Studio** (2022 o superior).
* **SDK de .NET** (Versión compatible con ASP.NET Core).
* **SQL Server** (o SQL Server Express / LocalDB).

### 2. Configuración de la Base de Datos

Deberás crear y poblar la base de datos con el esquema de tablas del proyecto:

1.  Abre **SQL Server Management Studio (SSMS)**.
2.  Crea una base de datos nueva (ej. `GriverTrainingSystem`).
3.  Ejecuta el script SQL que contiene las tablas `Users`, `Courses`, `Progress`, `Certificates`, etc., para crear la estructura completa.

### 3. Configuración de la Conexión en C#

Asegúrate de que la cadena de conexión en el archivo `appsettings.json` de tu proyecto `WebAPI` apunte a la base de datos que acabas de crear:

```json
{
  "ConnectionStrings": {
    // Asegúrate de que los valores aquí coincidan con tu servidor SQL local
    "DefaultConnection": "Server=TU_SERVIDOR_SQL;Database=GriverTrainingSystem;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
