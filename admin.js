// =============================
// 🔥 IMPORTS FIREBASE
// =============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =============================
// 🔥 CONFIG
// =============================
const firebaseConfig = {
  apiKey: "AIzaSyCFds2JVBdd5R9z8coNhyUI7SwJyNXmX98",
  authDomain: "studio-das-unhas.firebaseapp.com",
  projectId: "studio-das-unhas",
  storageBucket: "studio-das-unhas.appspot.com",
  messagingSenderId: "898989262612",
  appId: "1:898989262612:web:c644c5387cabd9a7b4a401"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =============================
// 🎯 ELEMENTOS
// =============================
const loginBox = document.getElementById("loginBox");
const painel = document.getElementById("painel");
const btnLogin = document.getElementById("btnLogin");
const logoutBtn = document.getElementById("logout");
const erroLogin = document.getElementById("loginErro");

const pendentesDiv = document.getElementById("pendentes");
const confirmadosDiv = document.getElementById("confirmados");
const canceladosDiv = document.getElementById("cancelados");

const dataInicio = document.getElementById("dataInicio");
const dataFim = document.getElementById("dataFim");
const btnFiltrar = document.getElementById("btnFiltrarPeriodo");
const btnLimpar = document.getElementById("btnLimparPeriodo");

let unsubscribe = null;
let agendamentosCache = [];
let filtroAtivo = false;

// =============================
// 🔐 LOGIN
// =============================
btnLogin?.addEventListener("click", async () => {

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!email || !senha) {
    erroLogin.textContent = "Preencha email e senha.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    erroLogin.textContent = "";
  } catch (error) {
    erroLogin.textContent = "Erro ao fazer login.";
  }
});

// =============================
// 🔐 SESSÃO
// =============================
onAuthStateChanged(auth, (user) => {

  if (user) {
    loginBox.style.display = "none";
    painel.style.display = "block";
    iniciarListener();
  } else {
    loginBox.style.display = "block";
    painel.style.display = "none";
    if (unsubscribe) unsubscribe();
  }

});

// =============================
// 🚪 LOGOUT
// =============================
logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
});

// =============================
// 🔥 LISTENER
// =============================
function iniciarListener() {

  if (unsubscribe) unsubscribe();

  const ref = collection(db, "agendamentos");

  unsubscribe = onSnapshot(ref, (snapshot) => {

    agendamentosCache = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    aplicarFiltro();

  });

}

// =============================
// 📅 FILTRO POR PERÍODO
// =============================
btnFiltrar?.addEventListener("click", () => {
  filtroAtivo = true;
  aplicarFiltro();
});

btnLimpar?.addEventListener("click", () => {
  dataInicio.value = "";
  dataFim.value = "";
  filtroAtivo = false;
  renderizar(agendamentosCache);
});

function aplicarFiltro() {

  if (!filtroAtivo || !dataInicio.value || !dataFim.value) {
    renderizar(agendamentosCache);
    return;
  }

  const inicio = dataInicio.value;
  const fim = dataFim.value;

  const filtrados = agendamentosCache.filter(item => {
    if (!item.data) return false;
    return item.data >= inicio && item.data <= fim;
  });

  renderizar(filtrados);
}

// =============================
// 🎨 RENDERIZAÇÃO
// =============================
function renderizar(lista) {

  pendentesDiv.innerHTML = "";
  confirmadosDiv.innerHTML = "";
  canceladosDiv.innerHTML = "";

  if (!lista.length) {
    pendentesDiv.innerHTML = "<p>Nenhum agendamento encontrado.</p>";
    return;
  }

  lista
    .sort((a, b) => (a.data || "").localeCompare(b.data || ""))
    .forEach(dados => {

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <strong>Cliente:</strong> ${dados.nome ?? "-"}<br>
        <strong>Contato:</strong> ${dados.contato ?? "-"}<br>
        <strong>Serviço:</strong> ${dados.servico ?? "-"}<br>
        <strong>Data:</strong> ${dados.data ?? "-"}<br>
        <strong>Horário:</strong> ${dados.horario ?? "-"}<br>
        <strong>Status:</strong> ${dados.status ?? "pendente"}<br><br>

        <button class="confirmar">Confirmar</button>
        <button class="cancelar">Cancelar</button>
        <button class="excluir">Excluir</button>
      `;

      div.querySelector(".confirmar").addEventListener("click", async () => {
        await updateDoc(doc(db, "agendamentos", dados.id), {
          status: "confirmado"
        });
      });

      div.querySelector(".cancelar").addEventListener("click", async () => {
        await updateDoc(doc(db, "agendamentos", dados.id), {
          status: "cancelado"
        });
      });

      div.querySelector(".excluir").addEventListener("click", async () => {
        if (confirm("Deseja excluir este agendamento?")) {
          await deleteDoc(doc(db, "agendamentos", dados.id));
        }
      });

      const status = dados.status || "pendente";

      if (status === "confirmado") {
        confirmadosDiv.appendChild(div);
      } else if (status === "cancelado") {
        canceladosDiv.appendChild(div);
      } else {
        pendentesDiv.appendChild(div);
      }

    });
}