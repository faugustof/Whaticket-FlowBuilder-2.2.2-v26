export function randomizarCaminho(chance: number) {
    const chanceA = chance; // 20% de chance para o caminho A
    const max = 1
    const min = 0
    const numeroAleatorio = Math.random() * (max - min) + min; // Gere um número aleatório entre 0 e 1
  
    if (numeroAleatorio < chanceA) {
      return "A";
    } else {
      return "B";
    }
  }
  