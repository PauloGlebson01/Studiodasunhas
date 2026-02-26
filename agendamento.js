const numeroWhats = "5583986066093";

const dataInput = document.getElementById('data');
const hoje = new Date();
const ano = hoje.getFullYear();
const mes = String(hoje.getMonth() + 1).padStart(2, '0');
const dia = String(hoje.getDate()).padStart(2, '0');
dataInput.min = `${ano}-${mes}-${dia}`;

const horariosDisponiveis = [
  "08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00","17:00",
  "18:00","19:00","20:00","21:00"
];

const horariosDiv = document.getElementById('horarios');
let horarioSelecionado = "";

/* ============================= */
/*  FUNÇÃO PARA PEGAR AGENDAMENTOS */
/* ============================= */
function getAgendamentos() {
  return JSON.parse(localStorage.getItem("agendamentos")) || {};
}

function salvarAgendamento(data, hora) {
  const agendamentos = getAgendamentos();

  if (!agendamentos[data]) {
    agendamentos[data] = [];
  }

  agendamentos[data].push(hora);
  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
}

/* ============================= */
/*  CRIAR BOTÕES */
/* ============================= */
function criarBotoesHorarios() {
  horariosDiv.innerHTML = "";
  horarioSelecionado = "";

  const dataSelecionada = dataInput.value;
  const agendamentos = getAgendamentos();
  const horariosOcupados = agendamentos[dataSelecionada] || [];

  horariosDisponiveis.forEach(hora => {
    const btn = document.createElement('button');
    btn.type = "button";
    btn.className = "horario-btn";
    btn.textContent = hora;

    // Se já estiver agendado, bloquear
    if (horariosOcupados.includes(hora)) {
      btn.disabled = true;
      btn.classList.add("indisponivel");
    }

    btn.addEventListener('click', () => {

      if (btn.disabled) return;

      // Remove seleção anterior
      document.querySelectorAll('.horario-btn')
        .forEach(b => b.classList.remove('selecionado'));

      btn.classList.add('selecionado');
      horarioSelecionado = hora;
    });

    horariosDiv.appendChild(btn);
  });
}

dataInput.addEventListener('change', criarBotoesHorarios);
criarBotoesHorarios();

/* ============================= */
/*  ENVIO */
/* ============================= */
const form = document.getElementById('agendamentoForm');
const mensagem = document.getElementById('mensagem');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const servico = document.getElementById('servico').value;
  const data = document.getElementById('data').value;

  if (servico && data && horarioSelecionado) {

    // Salvar como ocupado
    salvarAgendamento(data, horarioSelecionado);

    const texto = `Olá, gostaria de agendar o serviço: ${servico} na data ${data} às ${horarioSelecionado}.`;
    const url = `https://api.whatsapp.com/send?phone=${numeroWhats}&text=${encodeURIComponent(texto)}`;

    window.open(url, '_blank');

    mensagem.innerHTML = `<p>✅ Horário reservado com sucesso!</p>`;
    mensagem.style.color = '#ff2e84';

    form.reset();
    criarBotoesHorarios();

  } else {
    mensagem.innerHTML = `<p>⚠️ Por favor, selecione todos os campos e o horário desejado.</p>`;
    mensagem.style.color = 'red';
  }
});