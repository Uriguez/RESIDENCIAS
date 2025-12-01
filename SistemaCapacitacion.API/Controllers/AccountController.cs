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

[Authorize] // Todo el controlador requiere login salvo donde se marque AllowAnonymous
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

        if (!ModelState.IsValid) return View(vm);

        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u =>
                u.Email == vm.Email &&
                (u.Status == "Active" || u.Status == "Activo"));

        // Comparación directa con el campo Password de la tabla
        var ok = user is not null
                 && !string.IsNullOrEmpty(user.Passwords)
                 && user.Passwords == vm.Passwords;

        if (!ok)
        {
            ModelState.AddModelError(string.Empty, "Credenciales inválidas.");
            return View(vm);
        }

        // Resolver rol por el puesto (Position)
        string role = "Employee";
        var pos = (user.Position ?? "").ToLowerInvariant();
        if (pos.Contains("admin")) role = "Admin";
        else if (pos.Contains("recursos humanos") || pos.Contains("rh")) role = "RH";

        // Crear cookie de autenticación
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

        // Redirección por rol
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
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction(nameof(Login));
    }

    [AllowAnonymous]
    public IActionResult Denied() => View();

    // ================== PERFIL ==================

    [HttpPost]
    [ValidateAntiForgeryToken]


    public async Task<IActionResult> UpdateProfile(EditProfileViewModel model)
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(idStr, out var idUser))
            return RedirectToAction(nameof(Login));

        var user = await _db.Users.FirstOrDefaultAsync(u => u.IdUser == idUser);
        if (user == null)
            return RedirectToAction(nameof(Login));

        // ... (Tu lógica de nombre y departamento sigue igual) ...

        // ===== Foto de perfil (CORREGIDO) =====
        // Usamos model.NewPhoto en lugar de la variable 'photo'
        if (model.NewPhoto is not null && model.NewPhoto.Length > 0)
        {
            var uploadsRoot = Path.Combine(_env.WebRootPath, "uploads", "avatars");
            if (!Directory.Exists(uploadsRoot))
                Directory.CreateDirectory(uploadsRoot);

            // Opcional: Borrar foto anterior para no llenar el servidor
            if (!string.IsNullOrEmpty(user.PhotoUrl))
            {
                var oldPath = Path.Combine(_env.WebRootPath, user.PhotoUrl.TrimStart('/'));
                if (System.IO.File.Exists(oldPath))
                {
                    System.IO.File.Delete(oldPath);
                }
            }

            var ext = Path.GetExtension(model.NewPhoto.FileName);
            // Usamos GUID para evitar problemas de caché en el navegador
            var fileName = $"{user.IdUser}_{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsRoot, fileName);

            using (var stream = System.IO.File.Create(filePath))
            {
                await model.NewPhoto.CopyToAsync(stream);
            }

            user.PhotoUrl = $"/uploads/avatars/{fileName}";
        }

        await _db.SaveChangesAsync();

    // Vuelves al dashboard (o a donde prefieras)
    return RedirectToAction("Dashboard", "Admin");
}

}
