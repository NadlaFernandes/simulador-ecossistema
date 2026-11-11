import { randomRange, calcularDistancia } from './utils.js';

export class Carnivoro {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.energia = 150;
        this.idade = 0;
        this.maxIdade = randomRange(1000, 1400);
        this.velocidade = 2.3;
        this.raioVisao = 180;
        this.emLuta = false;
    }

    atualizar(larguraCanvas, alturaCanvas, todasPresas, plantas) {
        this.idade++;
        this.emLuta = false;

        let alvoMaisProximo = null;
        let menorDist = this.raioVisao;
        let procurandoPresa = true;

        // 1. Procura presas animais primeiro
        for (let presa of todasPresas) {
            let d = calcularDistancia(this.x, this.y, presa.x, presa.y);
            if (d < menorDist) {
                menorDist = d;
                alvoMaisProximo = presa;
            }
        }

        // 2. Se estiver com fome (energia baixa) e não achar presa, ele apela para procurar plantas (onívoro)
        if (!alvoMaisProximo && this.energia < 90) {
            menorDist = this.raioVisao;
            for (let p of plantas) {
                let d = calcularDistancia(this.x, this.y, p.x, p.y);
                if (d < menorDist) {
                    menorDist = d;
                    alvoMaisProximo = p;
                    procurandoPresa = false;
                }
            }
        }

        if (alvoMaisProximo) {
            let angulo = Math.atan2(alvoMaisProximo.y - this.y, alvoMaisProximo.x - this.x);
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

        this.energia -= 0.14;

        if (this.energia > 200) {
            this.energia -= 80;
            return new Carnivoro(this.x + randomRange(-10, 10), this.y + randomRange(-10, 10));
        }
        return null;
    }

    desenhar(ctx) {
        // Cor alaranjada se estiver em luta, ou rosa/vermelho padrão
        ctx.fillStyle = this.emLuta ? '#FF9800' : '#E91E63';
        ctx.beginPath();
        ctx.rect(this.x - 5, this.y - 5, 10, 10);
        ctx.fill();
    }
}