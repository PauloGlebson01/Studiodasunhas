import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCFds2JVBdd5R9z8coNhyUI7SwJyNXmX98",
  authDomain: "studio-das-unhas.firebaseapp.com",
  projectId: "studio-das-unhas",
  storageBucket: "studio-das-unhas.firebasestorage.app",
  messagingSenderId: "898989262612",
  appId: "1:898989262612:web:c644c5387cabd9a7b4a401"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const lista = document.getElementById("lista");
const loginBox = document.getElementById("loginBox");
const painel = document.getElementById("painel");

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const btnLogin = document.getElementById("btnLogin");
const logoutBtn = document.getElementById("logout");
const loginErro = document.getElementById("loginErro");

/* ================= LOGIN ================= */

btnLogin?.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(
      auth,
      emailInput.value,
      senhaInput.value
    );
  } catch (error) {
    loginErro.innerText = "E-mail ou senha inválidos.";
  }
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBox.style.display = "none";
    painel.style.display = "block";
    carregarAgendamentos();
  } else {
    loginBox.style.display = "block";
    painel.style.display = "none";
  }
});

/* ================= AGENDAMENTOS ================= */

function carregarAgendamentos() {

  const q = query(
    collection(db, "agendamentos"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {

    lista.innerHTML = "";

    if (snapshot.empty) {
      lista.innerHTML = "<p class='vazio'>Nenhum agendamento encontrado.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {

      const dados = docSnap.data();
      const id = docSnap.id;

      const div = document.createElement("div");
      div.classList.add("card");

div.innerHTML = `
  <strong>👤 Cliente:</strong> ${dados.nome || "Não informado"}<br>
  <strong>📞 Contato:</strong> ${dados.contato || "Não informado"}<br><br>

  <strong>💅 Serviço:</strong> ${dados.servico}<br>
  <strong>📅 Data:</strong> ${dados.data}<br>
  <strong>⏰ Horário:</strong> ${dados.horario}<br>
  <strong>Status:</strong> 
  <span class="${dados.status}">${dados.status}</span>
  <br><br>

  <button class="confirmar">Confirmar</button>
  <button class="cancelar">Cancelar</button>
  <button class="excluir">Excluir</button>
`;

      div.querySelector(".confirmar").onclick = async () => {
        await updateDoc(doc(db, "agendamentos", id), {
          status: "confirmado"
        });
      };

      div.querySelector(".cancelar").onclick = async () => {
        await updateDoc(doc(db, "agendamentos", id), {
          status: "cancelado"
        });
      };

      div.querySelector(".excluir").onclick = async () => {
        if (confirm("Deseja excluir este agendamento?")) {
          await deleteDoc(doc(db, "agendamentos", id));
        }
      };

      lista.appendChild(div);
    });
  });
}