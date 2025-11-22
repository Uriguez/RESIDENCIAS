using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SistemaCapacitacion.Controllers
{
    [Authorize(Roles = "RH,Admin")]
    public class HumanResourcesController : Controller
    {
        public IActionResult Dashboard()
        {
            return View();
        }
    }
}
