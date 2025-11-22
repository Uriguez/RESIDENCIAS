namespace SistemaCapacitacion.Core.ViewModels;

public class LoginViewModel
{
    public string Email { get; set; } = string.Empty;
    public string Passwords { get; set; } = string.Empty;
    public bool RememberMe { get; set; }
    public string? Error { get; set; } // para mostrar “Credenciales inválidas”
}
