import { World } from './World.js';

const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const mundo = new World(canvas.width, canvas.height);

// Variável de controle de velocidade do tempo (agora aceita frações menores que 1)
let velocidadeSimulacao = 1.0; 
let acumuladorFrames = 0;

// Configuração do Chart.js
const chartCtx = document.getElementById('populationChart').getContext('2d');
const populationChart = new Chart(chartCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'Plantas', data: [], borderColor: '#8BC34A', tension: 0.1, pointRadius: 0 },
            { label: 'H. Rápidos', data: [], borderColor: '#4CAF50', tension: 0.1, pointRadius: 0 },
            { label: 'H. Tanques', data: [], borderColor: '#00BCD4', tension: 0.1, pointRadius: 0 },
            { label: 'Carnívoros', data: [], borderColor: '#E91E63', tension: 0.1, pointRadius: 0 }
        ]
    },
    options: {
        responsive: false,
        animation: false,
        scales: { x: { display: false }, y: { beginAtZero: true } }
    }
});

let frameCounter = 0;

function atualizarUIEstacao(estacao) {
    const el = document.getElementById('season-indicator');
    el.innerText = estacao;
    el.style.color = (estacao === 'Primavera') ? '#FFC107' : '#03A9F4';
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (velocidadeSimulacao >= 1.0) {
        // Velocidade normal ou acelerada (roda 1 ou N vezes por frame)
        for (let i = 0; i < velocidadeSimulacao; i++) {
            mundo.atualizar(atualizarUIEstacao);
        }
    } else if (velocidadeSimulacao > 0) {
        // Câmera lenta fracionada (ex: 0.5x ou 0.25x)
        // Acumula frações e só atualiza o mundo quando o acumulador atinge 1.0
        acumuladorFrames += velocidadeSimulacao;
        if (acumuladorFrames >= 1.0) {
            mundo.atualizar(atualizarUIEstacao);
            acumuladorFrames = 0;
        }
    }

    // Desenha o estado atual sempre na tela para manter a fluidez visual do canvas
    mundo.desenhar(ctx);

    // Atualiza contadores na UI
    document.getElementById('plant-count').innerText = mundo.plantas.length;
    document.getElementById('fast-count').innerText = mundo.rapidos.length;
    document.getElementById('tank-count').innerText = mundo.tanques.length;
    document.getElementById('carn-count').innerText = mundo.carnivoros.length;

    // Atualiza gráfico apenas se o tempo estiver correndo
    if (velocidadeSimulacao > 0) {
        frameCounter++;
        if (frameCounter % 10 === 0) {
            populationChart.data.labels.push('');
            populationChart.data.datasets[0].data.push(mundo.plantas.length);
            populationChart.data.datasets[1].data.push(mundo.rapidos.length);
            populationChart.data.datasets[2].data.push(mundo.tanques.length);
            populationChart.data.datasets[3].data.push(mundo.carnivoros.length);

            if (populationChart.data.labels.length > 100) {
                populationChart.data.labels.shift();
                populationChart.data.datasets.forEach(d => d.data.shift());
            }
            populationChart.update();
        }
    }

    requestAnimationFrame(loop);
}

// --- CONFIGURAR EVENTOS DOS BOTÕES DE CONTROLE ---
document.getElementById('btn-pause').addEventListener('click', () => {
    velocidadeSimulacao = 0;
});
document.getElementById('btn-slowest').addEventListener('click', () => {
    velocidadeSimulacao = 0.25; // Super lento (atualiza a cada 4 frames)
});
document.getElementById('btn-slow').addEventListener('click', () => {
    velocidadeSimulacao = 0.5;  // Câmera lenta (atualiza a cada 2 frames)
});
document.getElementById('btn-normal').addEventListener('click', () => {
    velocidadeSimulacao = 1.0;  // Normal
});
document.getElementById('btn-fast').addEventListener('click', () => {
    velocidadeSimulacao = 2.0;  // Acelerado
});

loop();