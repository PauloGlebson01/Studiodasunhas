/* =========================
   TEMA CLARO / ESCURO
========================= */

const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Carregar tema salvo
const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
    body.className = savedTheme;
    themeToggle.textContent = savedTheme === "dark" ? "🌙" : "☀️";
}

// Alternar tema
themeToggle.addEventListener("click", () => {
    if (body.classList.contains("dark")) {
        body.classList.remove("dark");
        body.classList.add("light");
        themeToggle.textContent = "☀️";
        localStorage.setItem("theme", "light");
    } else {
        body.classList.remove("light");
        body.classList.add("dark");
        themeToggle.textContent = "🌙";
        localStorage.setItem("theme", "dark");
    }
});


/* =========================
   MODAL DE COMPARTILHAMENTO
========================= */

const shareBtn = document.getElementById("shareBtn");
const shareModal = document.getElementById("shareModal");
const closeShare = document.getElementById("closeShare");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const shareLinkBtn = document.getElementById("shareLinkBtn");
const qrCodeContainer = document.getElementById("qrcode");

const pageUrl = window.location.href;

// Abrir modal
shareBtn.addEventListener("click", () => {
    shareModal.classList.add("active");

    // Gerar QR Code apenas uma vez
    if (!qrCodeContainer.hasChildNodes()) {
        new QRCode(qrCodeContainer, {
            text: pageUrl,
            width: 160,
            height: 160,
            colorDark: "#ff4fd8",
            colorLight: "#ffffff"
        });
    }
});

// Fechar modal
closeShare.addEventListener("click", () => {
    shareModal.classList.remove("active");
});

// Fechar clicando fora do conteúdo
shareModal.addEventListener("click", (e) => {
    if (e.target === shareModal) {
        shareModal.classList.remove("active");
    }
});


/* =========================
   COPIAR LINK
========================= */

copyLinkBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(pageUrl);
        copyLinkBtn.textContent = "✅ Link copiado!";
        setTimeout(() => {
            copyLinkBtn.textContent = "📋 Copiar link";
        }, 2000);
    } catch {
        alert("Não foi possível copiar o link 😢");
    }
});


/* =========================
   COMPARTILHAMENTO NATIVO
========================= */

shareLinkBtn.addEventListener("click", async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: "Cartão Digital | Nail Designer",
                text: "Confira meu cartão digital profissional 💅✨",
                url: pageUrl
            });
        } catch {
            console.log("Compartilhamento cancelado");
        }
    } else {
        alert("Seu navegador não suporta compartilhamento direto 😢");
    }
});
