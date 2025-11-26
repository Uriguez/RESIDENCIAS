using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using SistemaCapacitacion.Core.ViewModels;
using SistemaCapacitacion.Data;

namespace SistemaCapacitacion.API.Controllers;

[AllowAnonymous]
public class AccountController : Controller
{
    private readonly ApplicationDbContext _db;
    private readonly IWebHostEnvironment _env;

    public AccountController(ApplicationDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpGet]
    public IActionResult Login(string? returnUrl = null)
    {
        ViewData["ReturnUrl"] = returnUrl;
        return View(new LoginViewModel());
    }

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


        // 3) Resolver rol por el puesto (Position) o lo que definas
        string role = "Employee";
        var pos = (user.Position ?? "").ToLowerInvariant();
        if (pos.Contains("admin")) role = "Admin";
        else if (pos.Contains("recursos humanos") || pos.Contains("rh")) role = "RH";

        // 4) Crear cookie de autenticación
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

        // 5) Redirección por rol
        if (!string.IsNullOrWhiteSpace(returnUrl) && Url.IsLocalUrl(returnUrl))
            return Redirect(returnUrl);

        return role switch
        {
            "Admin" => RedirectToAction("Dashboard", "Admin"),
            "RH" => RedirectToAction("Inicio", "Admin"),     // o tu panel de RH si es distinto
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

    public IActionResult Denied() => View(); // opcional crear una vista simple
}
