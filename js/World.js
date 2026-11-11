import { HerbivoroRapido, HerbivoroTanque } from './Agent.js';
import { Carnivoro } from './Carnivoro.js';
import { Plant } from './Plant.js';
import { calcularDistancia } from './utils.js';

export const ESTACOES = { PRIMAVERA: 'Primavera', INVERNO: 'Inverno' };

export class World {
    constructor(largura, altura) {
        this.largura = largura;
        this.altura = altura;
        this.rapidos = [];
        this.tanques = [];
        this.carnivoros = [];
        this.plantas = [];

        this.estacaoAtual = ESTACOES.PRIMAVERA;
        this.tempoEstacao = 0;

        for (let i = 0; i < 25; i++) this.rapidos.push(new HerbivoroRapido(Math.random() * largura, Math.random() * altura));
        for (let i = 0; i < 10; i++) this.tanques.push(new HerbivoroTanque(Math.random() * largura, Math.random() * altura));
        for (let i = 0; i < 8; i++) this.carnivoros.push(new Carnivoro(Math.random() * largura, Math.random() * altura));
        
        // Criação inicial de plantas com distribuição de tipos
        for (let i = 0; i < 70; i++) {
            this.plantas.push(new Plant(Math.random() * largura, Math.random() * altura, this.sortearTipoPlanta()));
        }
    }

    sortearTipoPlanta() {
        let rand = Math.random();
        if (rand < 0.10) return 'supervenenosa'; // 10% de chance
        if (rand < 0.25) return 'venenosa';      // 15% de chance
        return 'normal';                         // 75% de chance
    }

    executarMigracao() {
        const borda = Math.floor(Math.random() * 4);
        let x = 0, y = 0;

        if (borda === 0) { x = Math.random() * this.largura; y = 0; }
        else if (borda === 1) { x = Math.random() * this.largura; y = this.altura; }
        else if (borda === 2) { x = 0; y = Math.random() * this.altura; }
        else { x = this.largura; y = Math.random() * this.altura; }

        if (this.estacaoAtual === ESTACOES.PRIMAVERA) {
            for (let i = 0; i < 5; i++) this.rapidos.push(new HerbivoroRapido(x + randomRange(-10, 10), y + randomRange(-10, 10)));
            for (let i = 0; i < 2; i++) this.tanques.push(new HerbivoroTanque(x + randomRange(-10, 10), y + randomRange(-10, 10)));
        } else {
            for (let i = 0; i < 3; i++) this.carnivoros.push(new Carnivoro(x + randomRange(-10, 10), y + randomRange(-10, 10)));
            for (let i = 0; i < 2; i++) this.rapidos.push(new HerbivoroRapido(x + randomRange(-10, 10), y + randomRange(-10, 10)));
        }
    }

    atualizar(atualizarUIEstacao) {
        this.tempoEstacao++;
        if (this.tempoEstacao % 400 === 0) {
            this.estacaoAtual = (this.estacaoAtual === ESTACOES.PRIMAVERA) ? ESTACOES.INVERNO : ESTACOES.PRIMAVERA;
            this.executarMigracao();
            if (atualizarUIEstacao) atualizarUIEstacao(this.estacaoAtual);
        }

        let chancePlanta = (this.estacaoAtual === ESTACOES.PRIMAVERA) ? 0.25 : 0.08;
        let maxPlantas = (this.estacaoAtual === ESTACOES.PRIMAVERA) ? 110 : 40;
        if (Math.random() < chancePlanta && this.plantas.length < maxPlantas) {
            this.plantas.push(new Plant(Math.random() * this.largura, Math.random() * this.altura, this.sortearTipoPlanta()));
        }

        let novosRapidos = [];
        this.rapidos.forEach(r => {
            let f = r.atualizar(this.largura, this.altura, this.plantas, this.carnivoros);
            if (f) novosRapidos.push(f);
        });
        this.rapidos.push(...novosRapidos);

        let novosTanques = [];
        this.tanques.forEach(t => {
            let f = t.atualizar(this.largura, this.altura, this.plantas);
            if (f) novosTanques.push(f);
        });
        this.tanques.push(...novosTanques);

        let todosHerbs = [...this.rapidos, ...this.tanques];
        let novosCarns = [];
        this.carnivoros.forEach(c => {
            let f = c.atualizar(this.largura, this.altura, todosHerbs, this.plantas);
            if (f) novosCarns.push(f);
        });
        this.carnivoros.push(...novosCarns);

        // 1. Carnívoros caçam Rápidos
        for (let i = this.carnivoros.length - 1; i >= 0; i--) {
            let c = this.carnivoros[i];
            if (c.energia <= 0 || c.idade > c.maxIdade) {
                this.carnivoros.splice(i, 1);
                continue;
            }

            for (let j = this.rapidos.length - 1; j >= 0; j--) {
                let r = this.rapidos[j];
                if (calcularDistancia(c.x, c.y, r.x, r.y) < 12) {
                    c.energia += 70;
                    this.rapidos.splice(j, 1);
                    break;
                }
            }
        }

        // 2. Luta Contínua: Carnívoros vs. Tanques
        for (let i = this.carnivoros.length - 1; i >= 0; i--) {
            let c = this.carnivoros[i];
            for (let j = this.tanques.length - 1; j >= 0; j--) {
                let t = this.tanques[j];
                
                if (calcularDistancia(c.x, c.y, t.x, t.y) < 16) {
                    c.emLuta = true;
                    t.emLuta = true;

                    c.energia -= 0.6;
                    t.energia -= 0.8;

                    if (t.energia <= 0) {
                        this.tanques.splice(j, 1);
                        c.energia += 90;
                        break;
                    }

                    if (c.energia <= 0) {
                        this.carnivoros.splice(i, 1);
                        break;
                    }
                }
            }
        }

        // 3. Carnívoros comem plantas (podem comer normais ou cair na armadilha das supervenenosas)
        for (let i = this.carnivoros.length - 1; i >= 0; i--) {
            let c = this.carnivoros[i];
            for (let j = this.plantas.length - 1; j >= 0; j--) {
                let p = this.plantas[j];
                if (calcularDistancia(c.x, c.y, p.x, p.y) < 10) {
                    c.energia += p.energia; // Se for supervenenosa (-999), a energia zera na hora
                    this.plantas.splice(j, 1);
                    break;
                }
            }
        }

        // 4. Herbívoros Rápidos comem Plantas
        for (let i = this.rapidos.length - 1; i >= 0; i--) {
            let r = this.rapidos[i];
            if (r.energia <= 0 || r.idade > r.maxIdade) {
                this.rapidos.splice(i, 1);
                continue;
            }
            for (let j = this.plantas.length - 1; j >= 0; j--) {
                let p = this.plantas[j];
                if (calcularDistancia(r.x, r.y, p.x, p.y) < 9) {
                    r.energia += p.energia; // Se for supervenenosa, morre na hora
                    this.plantas.splice(j, 1);
                    break;
                }
            }
        }

        // 5. Herbívoros Tanques comem Plantas
        for (let i = this.tanques.length - 1; i >= 0; i--) {
            let t = this.tanques[i];
            if (t.energia <= 0 || t.idade > t.maxIdade) {
                this.tanques.splice(i, 1);
                continue;
            }
            for (let j = this.plantas.length - 1; j >= 0; j--) {
                let p = this.plantas[j];
                if (calcularDistancia(t.x, t.y, p.x, p.y) < 12) {
                    t.energia += p.energia; // Se for supervenenosa, morre na hora
                    this.plantas.splice(j, 1);
                    break;
                }
            }
        }
    }

    desenhar(ctx) {
        this.plantas.forEach(p => p.desenhar(ctx));
        this.rapidos.forEach(r => r.desenhar(ctx));
        this.tanques.forEach(t => t.desenhar(ctx));
        this.carnivoros.forEach(c => c.desenhar(ctx));
    }
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}