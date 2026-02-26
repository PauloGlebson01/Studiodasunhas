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
   LOCAL STORAGE
=========================== */

function getAgendamentos() {
  return JSON.parse(localStorage.getItem("agendamentos")) || {};
}

function salvarAgendamento(data, servico, hora) {
  const agendamentos = getAgendamentos();

  if (!agendamentos[data]) {
    agendamentos[data] = {};
  }

  if (!agendamentos[data][servico]) {
    agendamentos[data][servico] = [];
  }

  agendamentos[data][servico].push(hora);

  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
}

/* ===========================
   CRIAR BOTÕES
=========================== */

function criarBotoesHorarios() {

  horariosDiv.innerHTML = "";
  horarioSelecionado = "";

  const data = dataInput.value;
  const servico = servicoSelect.value;

  if (!data || !servico) {
    horariosDiv.innerHTML = "<p>Selecione data e serviço.</p>";
    return;
  }

  const agendamentos = getAgendamentos();
  const horariosOcupados =
    agendamentos[data] &&
    agendamentos[data][servico]
      ? agendamentos[data][servico]
      : [];

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

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const servico = servicoSelect.value;
  const data = dataInput.value;

  if (!servico || !data || !horarioSelecionado) {
    mensagem.innerHTML = "⚠️ Preencha todos os campos.";
    mensagem.style.color = "red";
    return;
  }

  salvarAgendamento(data, servico, horarioSelecionado);

  const texto = `Olá, gostaria de agendar o serviço: ${servico} na data ${data} às ${horarioSelecionado}.`;
  const url = `https://api.whatsapp.com/send?phone=${numeroWhats}&text=${encodeURIComponent(texto)}`;

  window.open(url, "_blank");

  mensagem.innerHTML = "✅ Horário reservado com sucesso!";
  mensagem.style.color = "#ff2e84";

  form.reset();
  criarBotoesHorarios();
});