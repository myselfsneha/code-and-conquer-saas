// =============================
// AUTO REDIRECT IF LOGGED IN
// =============================
if (localStorage.getItem("token")) {
    window.location.href = "dashboard.html";
}

// =============================
// SMOOTH SCROLL (FUTURE USE)
// =============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});

// =============================
// BUTTON CLICK ANIMATION
// =============================
const buttons = document.querySelectorAll(".btn");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        btn.style.transform = "scale(0.95)";
        setTimeout(() => {
            btn.style.transform = "scale(1)";
        }, 150);
    });
});

// =============================
// FADE-IN ON LOAD (ENHANCED)
// =============================
window.addEventListener("load", () => {
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.8s ease";

    setTimeout(() => {
        document.body.style.opacity = "1";
    }, 100);
});

// =============================
// KEYBOARD SHORTCUTS (PRO TOUCH)
// =============================
document.addEventListener("keydown", (e) => {

    // Press L → Login
    if (e.key.toLowerCase() === "l") {
        window.location.href = "login.html";
    }

    // Press R → Register
    if (e.key.toLowerCase() === "r") {
        window.location.href = "register.html";
    }

});

// =============================
// HOVER GLOW EFFECT (CARDS)
// =============================
const cards = document.querySelectorAll(".feature-card");

cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
        card.style.boxShadow = "0 0 20px rgba(255,255,255,0.4)";
    });

    card.addEventListener("mouseleave", () => {
        card.style.boxShadow = "none";
    });
});