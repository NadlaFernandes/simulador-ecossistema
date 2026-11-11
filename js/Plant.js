export class Plant {
    constructor(x, y, tipo = 'normal') {
        this.x = x;
        this.y = y;
        this.tipo = tipo; // 'normal', 'venenosa' (leve) ou 'supervenenosa' (mortal)

        if (tipo === 'supervenenosa') {
            this.energia = -999; // Letal instantânea
        } else if (tipo === 'venenosa') {
            this.energia = -40;  // Dano moderado
        } else {
            this.energia = 35;   // Nutritiva
        }
    }

    desenhar(ctx) {
        if (this.tipo === 'supervenenosa') {
            ctx.fillStyle = '#D32F2F'; // Vermelho sangue / Mortal
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.tipo === 'venenosa') {
            ctx.fillStyle = '#9C27B0'; // Roxo (Leve)
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#8BC34A'; // Verde Claro (Normal)
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}