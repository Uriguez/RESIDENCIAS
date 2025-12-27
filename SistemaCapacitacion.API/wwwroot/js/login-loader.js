/* ============================================================
   LOGIN LOADER - MÓDULO INDEPENDIENTE
   Compatible con Login.cshtml
============================================================ */

(function () {
    "use strict";

    // Obtiene el loader
    function getLoader() {
        return document.getElementById("loginLoader");
    }

    // Mostrar loader al enviar el formulario
    window.showLoginLoader = function () {
        const loader = getLoader();
        if (!loader) return;

        loader.classList.remove("hidden");
    };

    // Ocultar loader cuando la página destino terminó de cargar
    window.addEventListener("load", function () {
        const loader = getLoader();
        if (!loader) return;

        // Pequeño delay para transición suave
        setTimeout(() => {
            loader.classList.add("hidden");
        }, 200);
    });

})();
