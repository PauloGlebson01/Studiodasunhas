// =============================
// 🔥 IMPORTS FIREBASE
// =============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const contadorPendentes = document.getElementById("contadorPendentes");
const notificacao = document.getElementById("notificacao");

const exportExcelBtn = document.getElementById("exportExcel");
const exportPDFBtn = document.getElementById("exportPDF");

let unsubscribe = null;
let agendamentosCache = [];
let primeiroLoad = true;

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
  } catch {
    erroLogin.textContent = "Erro ao fazer login.";
  }
});

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

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
});

// =============================
// 🔥 LISTENER COM NOTIFICAÇÃO
// =============================
function iniciarListener() {

  if (unsubscribe) unsubscribe();

  const ref = collection(db, "agendamentos");

  unsubscribe = onSnapshot(ref, (snapshot) => {

    if (!primeiroLoad && snapshot.docChanges().some(change => change.type === "added")) {
      mostrarNotificacao();
    }

    primeiroLoad = false;

    agendamentosCache = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    renderizar(agendamentosCache);
  });
}

// =============================
// 🔔 NOTIFICAÇÃO VISUAL
// =============================
function mostrarNotificacao() {
  notificacao.style.display = "block";
  setTimeout(() => {
    notificacao.style.display = "none";
  }, 4000);
}

// =============================
// 🎨 RENDERIZAÇÃO
// =============================
function renderizar(lista) {

  pendentesDiv.innerHTML = "";
  confirmadosDiv.innerHTML = "";
  canceladosDiv.innerHTML = "";

  let totalPendentes = 0;

  lista
    .sort((a, b) => (a.data || "").localeCompare(b.data || ""))
    .forEach(dados => {

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <strong>Cliente:</strong> ${dados.nome ?? "-"}<br>
        <strong>Contato:</strong> ${dados.telefone ?? "-"}<br>
        <strong>Serviço:</strong> ${dados.servico ?? "-"}<br>
        <strong>Data:</strong> ${dados.data ?? "-"}<br>
        <strong>Horário:</strong> ${dados.horario ?? "-"}<br><br>

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
        totalPendentes++;
        pendentesDiv.appendChild(div);
      }
    });

  contadorPendentes.textContent = totalPendentes;
}

// =============================
// 📊 EXPORTAR EXCEL
// =============================
exportExcelBtn?.addEventListener("click", () => {

  let csv = "Cliente,Telefone,Servico,Data,Horario,Status\n";

  agendamentosCache.forEach(item => {
    csv += `${item.nome},${item.telefone},${item.servico},${item.data},${item.horario},${item.status}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "agendamentos.csv";
  a.click();
});

// =============================
// 🗂 EXPORTAR PDF
// =============================
exportPDFBtn?.addEventListener("click", () => {

  let conteudo = `
    <h2>Relatório de Agendamentos</h2>
    <table border="1" cellspacing="0" cellpadding="5">
      <tr>
        <th>Cliente</th>
        <th>Telefone</th>
        <th>Serviço</th>
        <th>Data</th>
        <th>Horário</th>
        <th>Status</th>
      </tr>
  `;

  agendamentosCache.forEach(item => {
    conteudo += `
      <tr>
        <td>${item.nome}</td>
        <td>${item.telefone}</td>
        <td>${item.servico}</td>
        <td>${item.data}</td>
        <td>${item.horario}</td>
        <td>${item.status}</td>
      </tr>
    `;
  });

  conteudo += "</table>";

  const janela = window.open("", "", "width=900,height=700");
  janela.document.write(conteudo);
  janela.print();
});