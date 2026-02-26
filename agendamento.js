const numeroWhats = "5583996083563";

const dataInput = document.getElementById('data');
const hoje = new Date();
const ano = hoje.getFullYear();
const mes = String(hoje.getMonth() + 1).padStart(2, '0');
const dia = String(hoje.getDate()).padStart(2, '0');
dataInput.min = `${ano}-${mes}-${dia}`;

const horariosDisponiveis = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
const horariosDiv = document.getElementById('horarios');
let horarioSelecionado = "";

// Cria todos os botões de horário
function criarBotoesHorarios() {
  horariosDiv.innerHTML = "";
  horariosDisponiveis.forEach(hora => {
    const btn = document.createElement('button');
    btn.type = "button";
    btn.className = "horario-btn";
    btn.textContent = hora;

    btn.addEventListener('click', () => {
      if (!btn.classList.contains('selecionado')) {
        btn.classList.add('selecionado');
        horarioSelecionado = hora;
      }
    });

    horariosDiv.appendChild(btn);
  });
}

dataInput.addEventListener('change', criarBotoesHorarios);
criarBotoesHorarios();

// Envio via WhatsApp
const form = document.getElementById('agendamentoForm');
const mensagem = document.getElementById('mensagem');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const servico = document.getElementById('servico').value;
  const data = document.getElementById('data').value;

  if (servico && data && horarioSelecionado) {
    const texto = `Olá, gostaria de agendar o serviço: ${servico} na data ${data} às ${horarioSelecionado}.`;
    const url = `https://api.whatsapp.com/send?phone=${numeroWhats}&text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');

    mensagem.innerHTML = `<p>✅ Seu agendamento está pronto! Clique no botão para enviar via WhatsApp.</p>`;
    mensagem.style.color = '#ff2e84';

    // Após enviar, marcar horário como indisponível
    document.querySelectorAll('.horario-btn').forEach(b => {
      if (b.textContent === horarioSelecionado) {
        b.classList.add('selecionado');
      }
    });

    horarioSelecionado = "";
    form.reset();
    criarBotoesHorarios();
  } else {
    mensagem.innerHTML = `<p>⚠️ Por favor, selecione todos os campos e o horário desejado.</p>`;
    mensagem.style.color = 'red';
  }
});
