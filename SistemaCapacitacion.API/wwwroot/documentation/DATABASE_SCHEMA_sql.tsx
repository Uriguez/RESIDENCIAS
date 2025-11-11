-- ====================================================================
-- GRIVER TRAINING SYSTEM - DATABASE SCHEMA
-- Sistema de Gestión de Cursos de Inducción
-- Versión: 1.0
-- Fecha: 2024
-- ====================================================================

-- Crear base de datos
CREATE DATABASE GriverTrainingSystem;
GO

USE GriverTrainingSystem;
GO

-- ====================================================================
-- TABLAS DE IDENTITY (ASP.NET Core Identity)
-- ====================================================================

-- Estas tablas se crean automáticamente por Entity Framework Identity
-- Pero las documentamos para referencia

-- AspNetRoles - Roles del sistema
-- AspNetUsers - Usuarios base de Identity
-- AspNetUserRoles - Relación usuarios-roles
-- AspNetUserClaims - Claims de usuarios
-- AspNetRoleClaims - Claims de roles
-- AspNetUserLogins - Logins externos
-- AspNetUserTokens - Tokens de usuario

-- ====================================================================
-- EXTENSIÓN DE TABLA DE USUARIOS
-- ====================================================================

-- Tabla Users (extensión de AspNetUsers)
CREATE TABLE Users (
    Id NVARCHAR(450) NOT NULL PRIMARY KEY, -- FK a AspNetUsers.Id
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Position NVARCHAR(100) NULL, -- Solo para empleados
    Department NVARCHAR(100) NULL,
    HireDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Status INT NOT NULL DEFAULT 1, -- 1=Active, 0=Inactive
    LastLoginDate DATETIME2 NULL,
    Avatar NVARCHAR(500) NULL, -- URL de la imagen
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Users_AspNetUsers FOREIGN KEY (Id) REFERENCES AspNetUsers(Id) ON DELETE CASCADE
);

-- Índices para Users
CREATE INDEX IX_Users_Department ON Users(Department);
CREATE INDEX IX_Users_Status ON Users(Status);
CREATE INDEX IX_Users_HireDate ON Users(HireDate);

-- ====================================================================
-- CURSOS Y CONTENIDO
-- ====================================================================

-- Tabla Courses
CREATE TABLE Courses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    ThumbnailUrl NVARCHAR(500) NULL,
    EstimatedDurationMinutes INT NOT NULL DEFAULT 60,
    Category INT NOT NULL, -- 1=Security, 2=Compliance, 3=Development, 4=Culture, 5=Technology
    Difficulty INT NOT NULL DEFAULT 1, -- 1=Beginner, 2=Intermediate, 3=Advanced
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedById NVARCHAR(450) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Courses_CreatedBy FOREIGN KEY (CreatedById) REFERENCES AspNetUsers(Id)
);

-- Índices para Courses
CREATE INDEX IX_Courses_Category ON Courses(Category);
CREATE INDEX IX_Courses_IsActive ON Courses(IsActive);
CREATE INDEX IX_Courses_CreatedAt ON Courses(CreatedAt);

-- Tabla CourseContents
CREATE TABLE CourseContents (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CourseId INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,
    Type INT NOT NULL, -- 1=Video, 2=Document, 3=Quiz, 4=Interactive
    ContentUrl NVARCHAR(500) NULL, -- URL del contenido
    DurationMinutes INT NOT NULL DEFAULT 0,
    OrderIndex INT NOT NULL DEFAULT 0, -- Orden dentro del curso
    IsRequired BIT NOT NULL DEFAULT 1,
    MinimumScore INT NULL, -- Para quizzes, puntuación mínima
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_CourseContents_Course FOREIGN KEY (CourseId) REFERENCES Courses(Id) ON DELETE CASCADE
);

-- Índices para CourseContents
CREATE INDEX IX_CourseContents_CourseId ON CourseContents(CourseId);
CREATE INDEX IX_CourseContents_Order ON CourseContents(CourseId, OrderIndex);

-- ====================================================================
-- ASIGNACIÓN DE CURSOS Y PROGRESO
-- ====================================================================

-- Tabla UserCourses (Relación Many-to-Many entre Users y Courses)
CREATE TABLE UserCourses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(450) NOT NULL,
    CourseId INT NOT NULL,
    AssignedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    AssignedById NVARCHAR(450) NOT NULL, -- Quien asignó el curso
    DueDate DATETIME2 NULL, -- Fecha límite opcional
    Status INT NOT NULL DEFAULT 0, -- 0=NotStarted, 1=InProgress, 2=Completed, 3=Expired
    
    CONSTRAINT FK_UserCourses_User FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserCourses_Course FOREIGN KEY (CourseId) REFERENCES Courses(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserCourses_AssignedBy FOREIGN KEY (AssignedById) REFERENCES AspNetUsers(Id),
    CONSTRAINT UK_UserCourses_UserCourse UNIQUE (UserId, CourseId)
);

-- Índices para UserCourses
CREATE INDEX IX_UserCourses_UserId ON UserCourses(UserId);
CREATE INDEX IX_UserCourses_CourseId ON UserCourses(CourseId);
CREATE INDEX IX_UserCourses_Status ON UserCourses(Status);

-- Tabla Progress (Progreso detallado por contenido)
CREATE TABLE Progress (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(450) NOT NULL,
    CourseId INT NOT NULL,
    ContentId INT NULL, -- NULL para progreso general del curso
    CompletionPercentage DECIMAL(5,2) NOT NULL DEFAULT 0, -- 0.00 a 100.00
    TimeSpentMinutes INT NOT NULL DEFAULT 0,
    Score INT NULL, -- Para quizzes y evaluaciones
    IsCompleted BIT NOT NULL DEFAULT 0,
    CompletedAt DATETIME2 NULL,
    LastAccessedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Progress_User FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Progress_Course FOREIGN KEY (CourseId) REFERENCES Courses(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Progress_Content FOREIGN KEY (ContentId) REFERENCES CourseContents(Id),
    CONSTRAINT UK_Progress_UserCourseContent UNIQUE (UserId, CourseId, ContentId)
);

-- Índices para Progress
CREATE INDEX IX_Progress_UserId ON Progress(UserId);
CREATE INDEX IX_Progress_CourseId ON Progress(CourseId);
CREATE INDEX IX_Progress_LastAccessed ON Progress(LastAccessedAt);

-- ====================================================================
-- CERTIFICADOS
-- ====================================================================

-- Tabla Certificates
CREATE TABLE Certificates (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(450) NOT NULL,
    CourseId INT NOT NULL,
    CertificateNumber NVARCHAR(50) NOT NULL UNIQUE, -- Número único del certificado
    IssuedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ExpirationDate DATETIME2 NULL, -- Algunos certificados pueden expirar
    Score DECIMAL(5,2) NOT NULL, -- Puntuación obtenida (0.00 a 100.00)
    CertificateUrl NVARCHAR(500) NULL, -- URL del PDF del certificado
    IsValid BIT NOT NULL DEFAULT 1, -- Puede ser revocado
    IssuedById NVARCHAR(450) NOT NULL, -- Quien emitió el certificado (sistema/admin)
    
    CONSTRAINT FK_Certificates_User FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id),
    CONSTRAINT FK_Certificates_Course FOREIGN KEY (CourseId) REFERENCES Courses(Id),
    CONSTRAINT FK_Certificates_IssuedBy FOREIGN KEY (IssuedById) REFERENCES AspNetUsers(Id),
    CONSTRAINT UK_Certificates_UserCourse UNIQUE (UserId, CourseId)
);

-- Índices para Certificates
CREATE INDEX IX_Certificates_UserId ON Certificates(UserId);
CREATE INDEX IX_Certificates_CourseId ON Certificates(CourseId);
CREATE INDEX IX_Certificates_IssuedDate ON Certificates(IssuedDate);
CREATE INDEX IX_Certificates_CertificateNumber ON Certificates(CertificateNumber);

-- ====================================================================
-- NOTIFICACIONES
-- ====================================================================

-- Tabla Notifications
CREATE TABLE Notifications (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(450) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(1000) NOT NULL,
    Type INT NOT NULL, -- 1=Info, 2=Warning, 3=Success, 4=Error
    IsRead BIT NOT NULL DEFAULT 0,
    ActionUrl NVARCHAR(500) NULL, -- URL para acción relacionada
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ReadAt DATETIME2 NULL,
    
    CONSTRAINT FK_Notifications_User FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id) ON DELETE CASCADE
);

-- Índices para Notifications
CREATE INDEX IX_Notifications_UserId ON Notifications(UserId);
CREATE INDEX IX_Notifications_IsRead ON Notifications(IsRead);
CREATE INDEX IX_Notifications_CreatedAt ON Notifications(CreatedAt);

-- ====================================================================
-- ACTIVIDADES Y AUDITORÍA
-- ====================================================================

-- Tabla Activities (Log de actividades del sistema)
CREATE TABLE Activities (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId NVARCHAR(450) NULL, -- NULL para actividades del sistema
    Action NVARCHAR(100) NOT NULL, -- Tipo de acción (LOGIN, COURSE_COMPLETED, etc.)
    EntityType NVARCHAR(50) NULL, -- Tipo de entidad afectada (Course, User, etc.)
    EntityId NVARCHAR(50) NULL, -- ID de la entidad afectada
    Description NVARCHAR(500) NOT NULL, -- Descripción de la actividad
    IpAddress NVARCHAR(45) NULL, -- IP del usuario
    UserAgent NVARCHAR(500) NULL, -- User Agent del navegador
    AdditionalData NVARCHAR(MAX) NULL, -- JSON con datos adicionales
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Activities_User FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id)
);

-- Índices para Activities
CREATE INDEX IX_Activities_UserId ON Activities(UserId);
CREATE INDEX IX_Activities_Action ON Activities(Action);
CREATE INDEX IX_Activities_CreatedAt ON Activities(CreatedAt);
CREATE INDEX IX_Activities_EntityType ON Activities(EntityType, EntityId);

-- ====================================================================
-- CONFIGURACIONES DEL SISTEMA
-- ====================================================================

-- Tabla SystemSettings
CREATE TABLE SystemSettings (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SettingKey NVARCHAR(100) NOT NULL UNIQUE,
    SettingValue NVARCHAR(MAX) NOT NULL,
    Description NVARCHAR(500) NULL,
    Category NVARCHAR(50) NOT NULL DEFAULT 'General',
    UpdatedById NVARCHAR(450) NOT NULL,
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_SystemSettings_UpdatedBy FOREIGN KEY (UpdatedById) REFERENCES AspNetUsers(Id)
);

-- Índices para SystemSettings
CREATE INDEX IX_SystemSettings_Category ON SystemSettings(Category);

-- ====================================================================
-- DEPARTAMENTOS
-- ====================================================================

-- Tabla Departments
CREATE TABLE Departments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL,
    ManagerId NVARCHAR(450) NULL, -- Jefe del departamento
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT FK_Departments_Manager FOREIGN KEY (ManagerId) REFERENCES AspNetUsers(Id)
);

-- Índices para Departments
CREATE INDEX IX_Departments_IsActive ON Departments(IsActive);

-- ====================================================================
-- DATOS INICIALES
-- ====================================================================

-- Insertar departamentos iniciales
INSERT INTO Departments (Name, Description) VALUES
('Administración', 'Departamento de administración general'),
('Recursos Humanos', 'Gestión de talento humano'),
('Ventas', 'Equipo comercial y ventas'),
('Marketing', 'Marketing y comunicaciones'),
('IT', 'Tecnologías de la información'),
('Finanzas', 'Gestión financiera y contable');

-- Insertar roles (estos los maneja Identity, pero los documentamos)
-- Admin, RH, Employee, Intern

-- Insertar configuraciones del sistema
INSERT INTO SystemSettings (SettingKey, SettingValue, Description, Category, UpdatedById) VALUES
('CompanyName', 'Griver', 'Nombre de la empresa', 'General', '1'),
('CompanyLogo', '/images/griver-logo.png', 'Logo de la empresa', 'General', '1'),
('DefaultCourseImage', '/images/default-course.jpg', 'Imagen por defecto para cursos', 'Courses', '1'),
('MaxFileUploadSize', '52428800', 'Tamaño máximo para subir archivos (50MB)', 'Files', '1'),
('CertificateTemplate', '/templates/certificate-template.html', 'Template para certificados', 'Certificates', '1'),
('NotificationEmailFrom', 'noreply@griver.com', 'Email remitente para notificaciones', 'Notifications', '1'),
('RequireEmailConfirmation', 'false', 'Requerir confirmación de email', 'Security', '1'),
('SessionTimeoutMinutes', '120', 'Timeout de sesión en minutos', 'Security', '1');

-- ====================================================================
-- VISTAS ÚTILES
-- ====================================================================

-- Vista de resumen de usuarios
CREATE VIEW vw_UserSummary AS
SELECT 
    u.Id,
    u.Email,
    usr.FirstName,
    usr.LastName,
    usr.FirstName + ' ' + usr.LastName AS FullName,
    usr.Position,
    usr.Department,
    usr.Status,
    usr.HireDate,
    usr.LastLoginDate,
    r.Name AS RoleName,
    (SELECT COUNT(*) FROM UserCourses uc WHERE uc.UserId = u.Id) AS AssignedCoursesCount,
    (SELECT COUNT(*) FROM UserCourses uc WHERE uc.UserId = u.Id AND uc.Status = 2) AS CompletedCoursesCount,
    (SELECT COUNT(*) FROM Certificates c WHERE c.UserId = u.Id AND c.IsValid = 1) AS CertificatesCount
FROM AspNetUsers u
    INNER JOIN Users usr ON u.Id = usr.Id
    LEFT JOIN AspNetUserRoles ur ON u.Id = ur.UserId
    LEFT JOIN AspNetRoles r ON ur.RoleId = r.Id
WHERE usr.Status = 1;

-- Vista de progreso de cursos
CREATE VIEW vw_CourseProgress AS
SELECT 
    c.Id AS CourseId,
    c.Title AS CourseTitle,
    c.Category,
    c.Difficulty,
    COUNT(DISTINCT uc.UserId) AS TotalAssigned,
    COUNT(DISTINCT CASE WHEN uc.Status = 2 THEN uc.UserId END) AS TotalCompleted,
    COUNT(DISTINCT CASE WHEN uc.Status = 1 THEN uc.UserId END) AS TotalInProgress,
    COUNT(DISTINCT CASE WHEN uc.Status = 0 THEN uc.UserId END) AS TotalNotStarted,
    CASE 
        WHEN COUNT(DISTINCT uc.UserId) = 0 THEN 0
        ELSE CAST(COUNT(DISTINCT CASE WHEN uc.Status = 2 THEN uc.UserId END) * 100.0 / COUNT(DISTINCT uc.UserId) AS DECIMAL(5,2))
    END AS CompletionRate
FROM Courses c
    LEFT JOIN UserCourses uc ON c.Id = uc.CourseId
WHERE c.IsActive = 1
GROUP BY c.Id, c.Title, c.Category, c.Difficulty;

-- Vista de actividad reciente
CREATE VIEW vw_RecentActivity AS
SELECT TOP 100
    a.Id,
    a.UserId,
    COALESCE(usr.FirstName + ' ' + usr.LastName, 'Sistema') AS UserName,
    a.Action,
    a.Description,
    a.CreatedAt
FROM Activities a
    LEFT JOIN Users usr ON a.UserId = usr.Id
ORDER BY a.CreatedAt DESC;

-- ====================================================================
-- STORED PROCEDURES ÚTILES
-- ====================================================================

-- SP para obtener dashboard de usuario
CREATE PROCEDURE sp_GetUserDashboard
    @UserId NVARCHAR(450)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Información básica del usuario
    SELECT 
        u.Id,
        u.Email,
        usr.FirstName,
        usr.LastName,
        usr.Position,
        usr.Department,
        r.Name AS RoleName
    FROM AspNetUsers u
        INNER JOIN Users usr ON u.Id = usr.Id
        LEFT JOIN AspNetUserRoles ur ON u.Id = ur.UserId
        LEFT JOIN AspNetRoles r ON ur.RoleId = r.Id
    WHERE u.Id = @UserId;
    
    -- Estadísticas de cursos
    SELECT 
        COUNT(*) AS TotalAssigned,
        COUNT(CASE WHEN Status = 2 THEN 1 END) AS TotalCompleted,
        COUNT(CASE WHEN Status = 1 THEN 1 END) AS TotalInProgress,
        COUNT(CASE WHEN Status = 0 THEN 1 END) AS TotalNotStarted
    FROM UserCourses 
    WHERE UserId = @UserId;
    
    -- Cursos asignados con progreso
    SELECT 
        c.Id,
        c.Title,
        c.Description,
        c.ThumbnailUrl,
        c.EstimatedDurationMinutes,
        c.Category,
        uc.Status,
        uc.AssignedDate,
        uc.DueDate,
        COALESCE(p.CompletionPercentage, 0) AS Progress,
        p.LastAccessedAt
    FROM UserCourses uc
        INNER JOIN Courses c ON uc.CourseId = c.Id
        LEFT JOIN Progress p ON uc.UserId = p.UserId AND uc.CourseId = p.CourseId AND p.ContentId IS NULL
    WHERE uc.UserId = @UserId AND c.IsActive = 1
    ORDER BY uc.AssignedDate DESC;
    
    -- Notificaciones no leídas
    SELECT COUNT(*) AS UnreadCount
    FROM Notifications 
    WHERE UserId = @UserId AND IsRead = 0;
END;

-- SP para estadísticas de administrador
CREATE PROCEDURE sp_GetAdminStats
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Estadísticas generales
    SELECT 
        (SELECT COUNT(*) FROM Users WHERE Status = 1) AS ActiveUsers,
        (SELECT COUNT(*) FROM Courses WHERE IsActive = 1) AS ActiveCourses,
        (SELECT COUNT(*) FROM UserCourses WHERE Status = 2) AS CompletedEnrollments,
        (SELECT COUNT(*) FROM Certificates WHERE IsValid = 1) AS IssuedCertificates;
    
    -- Progreso por departamento
    SELECT 
        u.Department,
        COUNT(DISTINCT u.Id) AS TotalUsers,
        COUNT(DISTINCT uc.UserId) AS UsersWithCourses,
        COUNT(DISTINCT CASE WHEN uc.Status = 2 THEN uc.UserId END) AS UsersCompleted,
        CASE 
            WHEN COUNT(DISTINCT uc.UserId) = 0 THEN 0
            ELSE CAST(COUNT(DISTINCT CASE WHEN uc.Status = 2 THEN uc.UserId END) * 100.0 / COUNT(DISTINCT uc.UserId) AS DECIMAL(5,2))
        END AS CompletionRate
    FROM Users u
        LEFT JOIN UserCourses uc ON u.Id = uc.UserId
    WHERE u.Status = 1
    GROUP BY u.Department;
    
    -- Top 5 cursos más populares
    SELECT TOP 5
        c.Title,
        COUNT(uc.UserId) AS EnrollmentCount,
        COUNT(CASE WHEN uc.Status = 2 THEN 1 END) AS CompletionCount
    FROM Courses c
        LEFT JOIN UserCourses uc ON c.Id = uc.CourseId
    WHERE c.IsActive = 1
    GROUP BY c.Id, c.Title
    ORDER BY EnrollmentCount DESC;
END;

-- ====================================================================
-- TRIGGERS PARA AUDITORÍA
-- ====================================================================

-- Trigger para actualizar UpdatedAt en Users
CREATE TRIGGER tr_Users_UpdatedAt
ON Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users 
    SET UpdatedAt = GETUTCDATE()
    WHERE Id IN (SELECT Id FROM inserted);
END;

-- Trigger para actualizar UpdatedAt en Courses
CREATE TRIGGER tr_Courses_UpdatedAt
ON Courses
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Courses 
    SET UpdatedAt = GETUTCDATE()
    WHERE Id IN (SELECT Id FROM inserted);
END;

-- Trigger para log de actividades en completación de cursos
CREATE TRIGGER tr_UserCourses_Completed
ON UserCourses
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Activities (UserId, Action, EntityType, EntityId, Description)
    SELECT 
        i.UserId,
        'COURSE_COMPLETED',
        'UserCourse',
        CAST(i.Id AS NVARCHAR(50)),
        'Usuario completó el curso: ' + c.Title
    FROM inserted i
        INNER JOIN deleted d ON i.Id = d.Id
        INNER JOIN Courses c ON i.CourseId = c.Id
    WHERE i.Status = 2 AND d.Status != 2; -- Solo cuando cambia a completado
END;

-- ====================================================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ====================================================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX IX_UserCourses_UserStatus ON UserCourses(UserId, Status);
CREATE INDEX IX_Progress_UserCourse ON Progress(UserId, CourseId);
CREATE INDEX IX_Activities_UserAction ON Activities(UserId, Action, CreatedAt);
CREATE INDEX IX_Notifications_UserRead ON Notifications(UserId, IsRead, CreatedAt);

-- ====================================================================
-- FUNCIONES ÚTILES
-- ====================================================================

-- Función para calcular progreso de curso
CREATE FUNCTION fn_CalculateCourseProgress(@UserId NVARCHAR(450), @CourseId INT)
RETURNS DECIMAL(5,2)
AS
BEGIN
    DECLARE @TotalContents INT;
    DECLARE @CompletedContents INT;
    DECLARE @Progress DECIMAL(5,2);
    
    SELECT @TotalContents = COUNT(*)
    FROM CourseContents 
    WHERE CourseId = @CourseId AND IsRequired = 1;
    
    SELECT @CompletedContents = COUNT(*)
    FROM Progress p
        INNER JOIN CourseContents cc ON p.ContentId = cc.Id
    WHERE p.UserId = @UserId 
        AND p.CourseId = @CourseId 
        AND p.IsCompleted = 1
        AND cc.IsRequired = 1;
    
    IF @TotalContents = 0
        SET @Progress = 0;
    ELSE
        SET @Progress = CAST(@CompletedContents * 100.0 / @TotalContents AS DECIMAL(5,2));
    
    RETURN @Progress;
END;

PRINT 'Base de datos Griver Training System creada exitosamente.';
PRINT 'Recuerda ejecutar las migraciones de Identity para completar las tablas de autenticación.';