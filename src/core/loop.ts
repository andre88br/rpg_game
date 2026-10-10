/* Laco de jogo com passo de tempo limitado: se a aba ficar parada, o delta
   nao explode e o personagem nao atravessa parede. */
export type PassoJogo = (dt: number) => void;

export class Laco {
  private rodando = false;
  private ultimo = 0;
  private id = 0;
  fps = 0;
  private acumFps = 0;
  private quadros = 0;

  /* `aoErro`: um quadro deu erro. O laço não para por isso — o próximo
     quadro já está agendado —, e quem criou decide como avisar. */
  constructor(private passo: PassoJogo, private aoErro?: (e: unknown) => void) {}
  private ultimoErro = '';

  iniciar(): void {
    if (this.rodando) return;
    this.rodando = true;
    this.ultimo = performance.now();
    const tique = (agora: number) => {
      if (!this.rodando) return;
      // teto de 100ms: uma aba que voltou do plano de fundo nao pula meio mapa
      const dt = Math.min((agora - this.ultimo) / 1000, 0.1);
      this.ultimo = agora;
      this.acumFps += dt; this.quadros++;
      if (this.acumFps >= 0.5) {
        this.fps = Math.round(this.quadros / this.acumFps);
        this.acumFps = 0; this.quadros = 0;
      }
      // agenda antes de rodar: um erro num quadro não congela o jogo
      this.id = requestAnimationFrame(tique);
      try {
        this.passo(dt);
      } catch (e) {
        // o mesmo erro a cada quadro só é avisado uma vez
        const msg = e instanceof Error ? e.message : String(e);
        if (msg !== this.ultimoErro) {
          this.ultimoErro = msg;
          console.error(e);
          this.aoErro?.(e);
        }
      }
    };
    this.id = requestAnimationFrame(tique);
  }

  parar(): void { this.rodando = false; cancelAnimationFrame(this.id); }
}
