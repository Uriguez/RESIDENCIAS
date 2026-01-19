using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaCapacitacion.Core.ViewModels;
using SistemaCapacitacion.Data;
using SistemaCapacitacion.Data.Entities;
using System.Security.Claims;

namespace SistemaCapacitacion.API.Controllers;

[Authorize]
public class AccountController : Controller
{
    private readonly ApplicationDbContext _db;
    private readonly IWebHostEnvironment _env;

    public AccountController(ApplicationDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [AllowAnonymous]
    [HttpGet]
    public IActionResult Login(string? returnUrl = null)
    {
        ViewData["ReturnUrl"] = returnUrl;
        return View(new LoginViewModel());
    }

    [AllowAnonymous]
    [ValidateAntiForgeryToken]
    [HttpPost]
    public async Task<IActionResult> Login(LoginViewModel vm, string? returnUrl = null)
    {
        ViewData["ReturnUrl"] = returnUrl;

        if (!ModelState.IsValid)
            return View(vm);

        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u =>
                u.Email == vm.Email &&
                (u.Status == "Active" || u.Status == "Activo"));

        var ok = user is not null
                 && !string.IsNullOrEmpty(user.Passwords)
                 && user.Passwords == vm.Passwords;

        if (!ok)
        {
            ModelState.AddModelError(string.Empty, "Credenciales inválidas.");
            return View(vm);
        }

        string role = "Employee";
        var pos = (user.Position ?? "").ToLowerInvariant();
        if (pos.Contains("admin")) role = "Admin";
        else if (pos.Contains("recursos humanos") || pos.Contains("rh")) role = "RH";

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.IdUser.ToString()),
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}".Trim()),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
            new Claim(ClaimTypes.Role, role)
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        var props = new AuthenticationProperties
        {
            IsPersistent = vm.RememberMe,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(vm.RememberMe ? 48 : 8)
        };

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, props);

        if (!string.IsNullOrWhiteSpace(returnUrl) && Url.IsLocalUrl(returnUrl))
            return Redirect(returnUrl);

        return role switch
        {
            "Admin" => RedirectToAction("Dashboard", "Admin"),
            "RH" => RedirectToAction("Dashboard", "Admin"),
            _ => RedirectToAction("Inicio", "Empleado")
        };
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateProfile(EditProfileViewModel model, string? removePhoto)
    {
        // 1. Validar que el usuario esté logueado
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(idStr, out var idUser))
            return RedirectToAction(nameof(Login));

        // 2. Traer el usuario de la BD (con tracking para poder editarlo)
        var user = await _db.Users.FirstOrDefaultAsync(u => u.IdUser == idUser);
        if (user == null)
            return RedirectToAction(nameof(Login));

        // ---------------------------------------------------------
        // CASO A: ELIMINAR FOTO (Botón de basura)
        // ---------------------------------------------------------
        if (removePhoto == "true")
        {
            // Borramos el archivo físico si existe
            if (!string.IsNullOrEmpty(user.PhotoUrl))
            {
                var oldPath = Path.Combine(_env.WebRootPath, user.PhotoUrl.TrimStart('/', '\\'));
                if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
            }

            // Limpiamos la BD
            user.PhotoUrl = null;
            await _db.SaveChangesAsync();

            // Recargamos la página
            return RedirigirSegunRol(); 
        }

        // ---------------------------------------------------------
        // CASO B: GUARDAR CAMBIOS (Nombre, Depto y Nueva Foto)
        // ---------------------------------------------------------

        // 1. Actualizar Nombre Completo
        // Separamos "Juan Perez" en FirstName y LastName
        if (!string.IsNullOrWhiteSpace(model.FullName))
        {
            var parts = model.FullName.Trim().Split(' ', 2);
            user.FirstName = parts[0];
            user.LastName = parts.Length > 1 ? parts[1] : "";
        }

        // 2. Actualizar Departamento
        if (model.DepartmentId > 0)
        {
            user.DepartmentId = model.DepartmentId;
        }

        // 3. Subir Nueva Foto
        if (model.NewPhoto != null && model.NewPhoto.Length > 0)
        {
            var uploadsRoot = Path.Combine(_env.WebRootPath, "uploads", "avatars");
            
            // Crear carpeta si no existe
            if (!Directory.Exists(uploadsRoot)) 
                Directory.CreateDirectory(uploadsRoot);

            // Borrar foto vieja para no llenar el servidor de basura
            if (!string.IsNullOrEmpty(user.PhotoUrl))
            {
                var oldPath = Path.Combine(_env.WebRootPath, user.PhotoUrl.TrimStart('/', '\\'));
                if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
            }

            var ext = Path.GetExtension(model.NewPhoto.FileName);
            var fileName = $"{user.IdUser}_{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsRoot, fileName);

            // Guardar archivo
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await model.NewPhoto.CopyToAsync(stream);
            }

            // Actualizar ruta en BD
            user.PhotoUrl = $"/uploads/avatars/{fileName}";
        }

        // 4. Guardar Todo en Base de Datos
        await _db.SaveChangesAsync();

        return RedirigirSegunRol();
    }

    // Método auxiliar para saber a dónde mandarlos después de guardar
    private IActionResult RedirigirSegunRol()
    {
        // Usamos los Claims que ya tiene la cookie para decidir
        if (User.IsInRole("Admin") || User.IsInRole("RH"))
        {
            return RedirectToAction("Dashboard", "Admin");
        }
        
        // Empleados y cualquier otro
        return RedirectToAction("Inicio", "Empleado");
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction(nameof(Login));
    }
}
