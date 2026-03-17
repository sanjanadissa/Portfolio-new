// StarsBackground.ts

export interface StarOptions {
  starDensity?: number;
}

export interface Star {
  angle: number;
  radius: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
}

export class StarsBackground {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private stars: Star[] = [];
  private starDensity: number;
  private rotationSpeed: number = 0.00025;
  private time: number = 0;
  private center: { x: number; y: number } = { x: 0, y: 0 };
  private animationId?: number;

  constructor(canvas: HTMLCanvasElement, options: StarOptions = {}) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context not available');
    }
    this.ctx = context;
    this.starDensity = options.starDensity || 0.000065;

    this.init();
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  private init(): void {
    this.handleResize();
    this.animate();
  }

  private handleResize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Fallback to window dimensions in case the canvas hasn't laid out yet
    const w = rect.width > 0 ? rect.width : window.innerWidth;
    const h = rect.height > 0 ? rect.height : window.innerHeight;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;

    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    // Centre in the middle of the canvas so stars spread to all four corners
    this.center = { x: w / 2, y: h / 2 };

    this.generateStars(w, h);
  }

  private generateStars(width: number, height: number): void {
    // Use full diagonal so stars always cover every corner of the canvas
    const maxRadius = Math.sqrt(width ** 2 + height ** 2) / 1.2;
    const area = Math.PI * maxRadius * maxRadius;
    const numStars = Math.floor(area * this.starDensity * 1.5);

    this.stars = [];
    for (let i = 0; i < numStars; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * maxRadius; // even distribution in area
      this.stars.push({
        angle,
        radius,
        size: Math.random() * 1.35 + 0.5,
        baseOpacity: Math.random() * 0.5 + 0.6,
        twinkleSpeed: 0.5 + Math.random() * 0.5
      });
    }
  }

  private animate = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.time += 1;

    for (const star of this.stars) {
      star.angle += this.rotationSpeed;
      const x = this.center.x + star.radius * Math.cos(star.angle);
      const y = this.center.y + star.radius * Math.sin(star.angle);

      if (x >= -10 && x <= this.canvas.width + 10 && y >= -10 && y <= this.canvas.height + 10) {
        const opacity = star.baseOpacity + Math.sin(this.time * 0.015 / star.twinkleSpeed) * 0.94;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x, y, star.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.shadowColor = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  public addStar(width: number, height: number, offsetX: number = 0, offsetY: number = 0): void {
    const x = Math.random() * width + offsetX;
    const y = Math.random() * height + offsetY;
    const angle = Math.atan2(y - this.center.y, x - this.center.x);
    const radius = Math.sqrt((x - this.center.x) ** 2 + (y - this.center.y) ** 2);
    this.stars.push({
      angle,
      radius,
      size: Math.random() * 1.35 + 0.5,
      baseOpacity: Math.random() * 0.5 + 0.6,
      twinkleSpeed: 0.5 + Math.random() * 0.5
    });
  }

  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', this.handleResize);
  }
}