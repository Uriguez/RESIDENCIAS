document.addEventListener("DOMContentLoaded", function () {
    // ---------- Reloj sencillo ----------
    var clockEl = document.getElementById("adminClock");
    function updateClock() {
        if (!clockEl) return;
        var now = new Date();
        var hours = now.getHours().toString().padStart(2, "0");
        var minutes = now.getMinutes().toString().padStart(2, "0");
        clockEl.querySelector("span:last-child").textContent =
            hours + ":" + minutes;
    }
    updateClock();
    setInterval(updateClock, 60000);

    // ---------- Panel notificaciones ----------
    var btnNotifications = document.getElementById("btnNotifications");
    var notificationsPanel = document.getElementById("notificationsPanel");

    if (btnNotifications && notificationsPanel) {
        btnNotifications.addEventListener("click", function () {
            notificationsPanel.classList.toggle(
                "notifications-panel--open"
            );
        });
    }

    // ---------- Menú perfil ----------
    var profileToggle = document.getElementById("profileToggle");
    var profileMenu = document.getElementById("profileMenu");

    if (profileToggle && profileMenu) {
        profileToggle.addEventListener("click", function () {
            profileMenu.classList.toggle("profile-menu--open");
        });
    }

    // Cerrar paneles clicando fuera
    document.addEventListener("click", function (e) {
        if (
            notificationsPanel &&
            !notificationsPanel.contains(e.target) &&
            btnNotifications &&
            !btnNotifications.contains(e.target)
        ) {
            notificationsPanel.classList.remove(
                "notifications-panel--open"
            );
        }
        if (
            profileMenu &&
            !profileMenu.contains(e.target) &&
            profileToggle &&
            !profileToggle.contains(e.target)
        ) {
            profileMenu.classList.remove("profile-menu--open");
        }
    });

    // ---------- Modales genéricos ----------
    var openButtons = document.querySelectorAll("[data-open-modal]");
    openButtons.forEach(function (btn) {
        var targetId = btn.getAttribute("data-open-modal");
        btn.addEventListener("click", function () {
            var modal = document.getElementById(targetId);
            if (modal) {
                modal.classList.add("modal--open");
            }
        });
    });

    var closeButtons = document.querySelectorAll("[data-close-modal]");
    closeButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var modal = btn.closest(".modal");
            if (modal) {
                modal.classList.remove("modal--open");
            }
        });
    });
});

// ---- Modal de perfil ----
(function () {
    const modal = document.getElementById('profileModal');
    if (!modal) return;

    const openBtns = document.querySelectorAll('[data-open-profile-modal]');
    const closeBtns = modal.querySelectorAll('[data-profile-close]');

    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('modal--open');
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('modal--open');
        });
    });

    // cerrar haciendo clic en el fondo oscuro
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('modal--open');
        }
    });
})();

