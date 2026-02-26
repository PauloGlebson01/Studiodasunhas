import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const numeroWhats = "5583986066093";

const dataInput = document.getElementById('data');
const servicoSelect = document.getElementById('servico');
const horariosDiv = document.getElementById('horarios');
const form = document.getElementById('agendamentoForm');
const mensagem = document.getElementById('mensagem');

dataInput.min = new Date().toISOString().split("T")[0];

const horariosDisponiveis = [
  "08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00",
  "18:00","19:00","20:00","21:00"
];

let horarioSelecionado = "";

/* ===========================
   BUSCAR HORÁRIOS OCUPADOS FIREBASE
=========================== */

async function getHorariosOcupados(data, servico) {

  const q = query(
    collection(db, "agendamentos"),
    where("data", "==", data),
    where("servico", "==", servico)
  );

  const querySnapshot = await getDocs(q);

  const ocupados = [];
  querySnapshot.forEach(doc => {
    ocupados.push(doc.data().horario);
  });

  return ocupados;
}

/* ===========================
   CRIAR BOTÕES
=========================== */

async function criarBotoesHorarios() {

  horariosDiv.innerHTML = "";
  horarioSelecionado = "";

  const data = dataInput.value;
  const servico = servicoSelect.value;

  if (!data || !servico) {
    horariosDiv.innerHTML = "<p>Selecione data e serviço.</p>";
    return;
  }

  const horariosOcupados = await getHorariosOcupados(data, servico);

  horariosDisponiveis.forEach(hora => {

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "horario-btn";
    btn.textContent = hora;

    if (horariosOcupados.includes(hora)) {
      btn.disabled = true;
      btn.classList.add("indisponivel");
    }

    btn.addEventListener("click", () => {

      if (btn.disabled) return;

      document.querySelectorAll(".horario-btn")
        .forEach(b => b.classList.remove("selecionado"));

      btn.classList.add("selecionado");
      horarioSelecionado = hora;
    });

    horariosDiv.appendChild(btn);

  });
}

dataInput.addEventListener("change", criarBotoesHorarios);
servicoSelect.addEventListener("change", criarBotoesHorarios);

/* ===========================
   ENVIO
=========================== */

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const servico = servicoSelect.value;
  const data = dataInput.value;

  if (!servico || !data || !horarioSelecionado) {
    mensagem.innerHTML = "⚠️ Preencha todos os campos.";
    mensagem.style.color = "red";
    return;
  }

  try {

    await addDoc(collection(db, "agendamentos"), {
      servico,
      data,
      horario: horarioSelecionado,
      createdAt: new Date()
    });

    const texto = `Olá, gostaria de agendar o serviço: ${servico} na data ${data} às ${horarioSelecionado}.`;

    const url = `https://api.whatsapp.com/send?phone=${numeroWhats}&text=${encodeURIComponent(texto)}`;

    window.open(url, "_blank");

    mensagem.innerHTML = "✅ Horário reservado com sucesso!";
    mensagem.style.color = "#ff2e84";

    form.reset();
    criarBotoesHorarios();

  } catch (error) {
    console.error(error);
    mensagem.innerHTML = "❌ Erro ao salvar agendamento.";
    mensagem.style.color = "red";
  }
});