import { randomRange, calcularDistancia } from './utils.js';

export class HerbivoroRapido {
    constructor(x, y, genes = null) {
        this.x = x;
        this.y = y;
        this.energia = 80;
        this.idade = 0;
        this.maxIdade = randomRange(800, 1200);

        this.genes = genes ? {
            velocidade: Math.max(1.5, genes.velocidade + randomRange(-0.2, 0.2)),
            raioVisao: Math.max(80, genes.raioVisao + randomRange(-10, 10))
        } : {
            velocidade: 2.8,
            raioVisao: 130
        };
    }

    atualizar(larguraCanvas, alturaCanvas, plantas, carnivoros) {
        this.idade++;
        
        let predadorProximo = null;
        let menorDistPredador = this.genes.raioVisao;

        for (let c of carnivoros) {
            let d = calcularDistancia(this.x, this.y, c.x, c.y);
            if (d < menorDistPredador) {
                menorDistPredador = d;
                predadorProximo = c;
            }
        }

        if (predadorProximo) {
            let anguloFuga = Math.atan2(this.y - predadorProximo.y, this.x - predadorProximo.x);
            let boostFuga = this.genes.velocidade * 1.3;
            this.x += Math.cos(anguloFuga) * boostFuga;
            this.y += Math.sin(anguloFuga) * boostFuga;
            this.energia -= 0.2;
        } else {
            let plantaProxima = null;
            let menorDistPlanta = this.genes.raioVisao;
            for (let p of plantas) {
                let d = calcularDistancia(this.x, this.y, p.x, p.y);
                if (d < menorDistPlanta) {
                    menorDistPlanta = d;
                    plantaProxima = p;
                }
            }

            if (plantaProxima) {
                let angulo = Math.atan2(plantaProxima.y - this.y, plantaProxima.x - this.x);
                this.x += Math.cos(angulo) * this.genes.velocidade;
                this.y += Math.sin(angulo) * this.genes.velocidade;
            } else {
                this.x += randomRange(-this.genes.velocidade, this.genes.velocidade);
                this.y += randomRange(-this.genes.velocidade, this.genes.velocidade);
            }
            this.energia -= 0.12;
        }

        if (this.x < 0) this.x = larguraCanvas;
        if (this.x > larguraCanvas) this.x = 0;
        if (this.y < 0) this.y = alturaCanvas;
        if (this.y > alturaCanvas) this.y = 0;

        if (this.energia > 140) {
            this.energia -= 60;
            return new HerbivoroRapido(
                this.x + randomRange(-10, 10),
                this.y + randomRange(-10, 10),
                this.genes
            );
        }
        return null;
    }

    desenhar(ctx) {
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class HerbivoroTanque {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.energia = 160;
        this.idade = 0;
        this.maxIdade = randomRange(1000, 1500);
        this.velocidade = 1.5;
        this.raioVisao = 90;
        this.emLuta = false; // Flag para indicar se está lutando
    }

    atualizar(larguraCanvas, alturaCanvas, plantas) {
        this.idade++;
        this.emLuta = false; // Reseta a flag, o World vai reativar se houver combate

        let plantaProxima = null;
        let menorDist = this.raioVisao;
        for (let p of plantas) {
            let d = calcularDistancia(this.x, this.y, p.x, p.y);
            if (d < menorDist) {
                menorDist = d;
                plantaProxima = p;
            }
        }

        if (plantaProxima) {
            let angulo = Math.atan2(plantaProxima.y - this.y, plantaProxima.x - this.x);
            this.x += Math.cos(angulo) * this.velocidade;
            this.y += Math.sin(angulo) * this.velocidade;
        } else {
            this.x += randomRange(-this.velocidade, this.velocidade);
            this.y += randomRange(-this.velocidade, this.velocidade);
        }

        if (this.x < 0) this.x = larguraCanvas;
        if (this.x > larguraCanvas) this.x = 0;
        if (this.y < 0) this.y = alturaCanvas;
        if (this.y > alturaCanvas) this.y = 0;

        this.energia -= 0.1;

        if (this.energia > 220) {
            this.energia -= 90;
            return new HerbivoroTanque(this.x + randomRange(-10, 10), this.y + randomRange(-10, 10));
        }
        return null;
    }

    desenhar(ctx) {
        // Se estiver em luta, muda de cor temporariamente para indicar combate/tensão
        ctx.fillStyle = this.emLuta ? '#FF5722' : '#00BCD4';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}