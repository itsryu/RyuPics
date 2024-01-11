// Código otimizado de: https://codepen.io/cr0ybot/pen/zNyYeW;

const {
  particleCount,
  flareCount,
  motion,
  color,
  particleSizeBase,
  particleSizeMultiplier,
  flareSizeBase,
  flareSizeMultiplier,
  lineWidth,
  linkChance,
  linkLengthMin,
  linkLengthMax,
  linkOpacity,
  linkFade,
  linkSpeed,
  glareAngle,
  glareOpacityMultiplier,
  renderParticles,
  renderParticleGlare,
  renderFlares,
  renderLinks,
  renderMesh,
  flicker,
  flickerSmoothing,
  blurSize,
  randomMotion,
  noiseLength,
  noiseStrength,
} = {
  particleCount: 30,
  flareCount: 5,
  motion: 0.08,
  color: "#ffffff",
  particleSizeBase: 1,
  particleSizeMultiplier: 0.5,
  flareSizeBase: 100,
  flareSizeMultiplier: 100,
  lineWidth: 1.5,
  linkChance: 75,
  linkLengthMin: 5,
  linkLengthMax: 7,
  linkOpacity: 0.25,
  linkFade: 90,
  linkSpeed: 5,
  glareAngle: -60,
  glareOpacityMultiplier: 0.05,
  renderParticles: true,
  renderParticleGlare: true,
  renderFlares: true,
  renderLinks: true,
  renderMesh: false,
  flicker: true,
  flickerSmoothing: 15,
  blurSize: 0,
  randomMotion: true,
  noiseLength: 1000,
  noiseStrength: 1,
};

/**
 * Elemento canvas.
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("stars");

/**
 * Contexto do canvas.
 * @type {CanvasRenderingContext2D}
 */
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/**
 * Objeto mouse com as propriedades x e y.
 * @type {{x: number, y: number}}
 */
const mouse = { x: 0, y: 0 };

/**
 * Variável c. Multiplicador para os pontos de Delaunay.
 * @type {number}
 */
const c = 1000;

/**
 * Ângulo n em radianos.
 * @type {number}
 */
const nAngle = (Math.PI * 2) / noiseLength;

/**
 * Raio n.
 * @type {number}
 */
const nRad = 100;

/**
 * Array de pontos.
 * @type {Array}
 */
const points = [];

/**
 * Array de triângulos.
 * @type {Array}
 */
const triangles = [];

/**
 * Array de links.
 * @type {Array}
 */
const links = [];

/**
 * Array de partículas.
 * @type {Array}
 */
const particles = [];

/**
 * Array de flares.
 * @type {Array}
 */
const flares = [];

/**
 * @type {number} n - variável que armazena um número inteiro
 */
let n = 0;

/**
 * @type {{x: number, y: number}} nPos - objeto que armazena duas propriedades numéricas representando coordenadas
 */
let nPos = { x: 0, y: 0 };

/**
 * @type {Array} vertices - array que armazena uma lista de vértices
 */
let vertices = [];

function init() {
  try {
    let i, j, k;

    window.requestAnimFrame = (() => {
      return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
          window.setTimeout(callback, 1000 / 60);
        }
      );
    })();

    resize();

    mouse.x = canvas.clientWidth / 2;
    mouse.y = canvas.clientHeight / 2;

    for (i = 0; i < particleCount; i++) {
      const p = new Particle();
      particles.push(p);
      points.push([p.x * c, p.y * c]);
    }

    // Triangulação Delaunay
    // eslint-disable-next-line no-undef
    vertices = Delaunay.triangulate(points);

    let tri = [];
    for (i = 0; i < vertices.length; i++) {
      if (tri.length == 3) {
        triangles.push(tri);
        tri = [];
      }
      tri.push(vertices[i]);
    }

    for (i = 0; i < particles.length; i++) {
      for (j = 0; j < triangles.length; j++) {
        k = triangles[j].indexOf(i);
        if (k !== -1) {
          triangles[j].forEach(function (value) {
            if (value !== i && particles[i].neighbors.indexOf(value) == -1) {
              particles[i].neighbors.push(value);
            }
          });
        }
      }
    }

    if (renderFlares) {
      for (i = 0; i < flareCount; i++) {
        flares.push(new Flare());
      }
    }

    if (
      "ontouchstart" in document.documentElement &&
      window.DeviceOrientationEvent
    ) {
      window.addEventListener(
        "deviceorientation",
        function (e) {
          mouse.x =
            canvas.clientWidth / 2 -
            (e.gamma / 90) * (canvas.clientWidth / 2) * 2;
          mouse.y =
            canvas.clientHeight / 2 -
            (e.beta / 90) * (canvas.clientHeight / 2) * 2;
        },
        true
      );
    } else {
      document.body.addEventListener("mousemove", function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });
    }

    (function animloop() {
      // eslint-disable-next-line no-undef
      requestAnimFrame(animloop);
      resize();
      render();
    })();
  } catch (err) {
    setTimeout(init);
  }
}

function render() {
  if (randomMotion) {
    n++;

    if (n >= noiseLength) {
      n = 0;
    }

    nPos = noisePoint(n);
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  if (blurSize > 0) {
    context.shadowBlur = blurSize;
    context.shadowColor = color;
  }

  if (renderParticles) {
    for (let i = 0; i < particleCount; i++) {
      particles[i].render();
    }
  }

  if (renderMesh) {
    context.beginPath();
    for (let v = 0; v < vertices.length - 1; v++) {
      if ((v + 1) % 3 === 0) {
        continue;
      }

      const p1 = particles[vertices[v]],
        p2 = particles[vertices[v + 1]];

      const pos1 = position(p1.x, p1.y, p1.z),
        pos2 = position(p2.x, p2.y, p2.z);

      context.moveTo(pos1.x, pos1.y);
      context.lineTo(pos2.x, pos2.y);
    }
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.stroke();
    context.closePath();
  }

  if (renderLinks) {
    if (random(0, linkChance) == linkChance) {
      const length = random(linkLengthMin, linkLengthMax);
      const start = random(0, particles.length - 1);
      startLink(start, length);
    }

    for (let l = links.length - 1; l >= 0; l--) {
      if (links[l] && !links[l].finished) {
        links[l].render();
      } else {
        delete links[l];
      }
    }
  }

  if (renderFlares) {
    for (let j = 0; j < flareCount; j++) {
      flares[j].render();
    }
  }
}

function resize() {
  canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
  canvas.height = canvas.width * (canvas.clientHeight / canvas.clientWidth);
}

function startLink(vertex, length) {
  links.push(new Link(vertex, length));
}
const Particle = function () {
  this.x = random(-0.1, 1.1, true);
  this.y = random(-0.1, 1.1, true);
  this.z = random(0, 4);
  this.color = color;
  this.opacity = random(0.1, 1, true);
  this.flicker = 0;
  this.neighbors = [];
};

Particle.prototype.render = function () {
  const pos = position(this.x, this.y, this.z),
    r =
      (this.z * particleSizeMultiplier + particleSizeBase) *
      (sizeRatio() / 1000);

  let o = this.opacity;

  if (flicker) {
    const newVal = random(-0.5, 0.5, true);
    this.flicker += (newVal - this.flicker) / flickerSmoothing;
    if (this.flicker > 0.5) this.flicker = 0.5;
    if (this.flicker < -0.5) this.flicker = -0.5;
    o += this.flicker;
    if (o > 1) o = 1;
    if (o < 0) o = 0;
  }

  context.fillStyle = this.color;
  context.globalAlpha = o;
  context.beginPath();
  context.arc(pos.x, pos.y, r, 0, 2 * Math.PI, false);
  context.fill();
  context.closePath();

  if (renderParticleGlare) {
    context.globalAlpha = o * glareOpacityMultiplier;

    context.ellipse(
      pos.x,
      pos.y,
      r * 100,
      r,
      (glareAngle - (nPos.x - 0.5) * noiseStrength * motion) * (Math.PI / 180),
      0,
      2 * Math.PI,
      false
    );
    context.fill();
    context.closePath();
  }

  context.globalAlpha = 1;
};
const Flare = function () {
  this.x = random(-0.25, 1.25, true);
  this.y = random(-0.25, 1.25, true);
  this.z = random(0, 2);
  this.color = color;
  this.opacity = random(0.001, 0.01, true);
};

Flare.prototype.render = function () {
  const pos = position(this.x, this.y, this.z);
  const r =
    (this.z * flareSizeMultiplier + flareSizeBase) * (sizeRatio() / 1000);

  context.beginPath();
  context.globalAlpha = this.opacity;
  context.arc(pos.x, pos.y, r, 0, 2 * Math.PI, false);
  context.fillStyle = this.color;
  context.fill();
  context.closePath();
  context.globalAlpha = 1;
};
const Link = function (startVertex, numPoints) {
  this.length = numPoints;
  this.verts = [startVertex];
  this.stage = 0;
  this.linked = [startVertex];
  this.distances = [];
  this.traveled = 0;
  this.fade = 0;
  this.finished = false;
};

Link.prototype.render = function () {
  let i, p, pos, points, last;

  switch (this.stage) {
    case 0:
      last = particles[this.verts[this.verts.length - 1]];

      if (last && last.neighbors && last.neighbors.length > 0) {
        const neighbor = last.neighbors[random(0, last.neighbors.length - 1)];

        if (this.verts.indexOf(neighbor) == -1) {
          this.verts.push(neighbor);
        }
      } else {
        this.stage = 3;
        this.finished = true;
      }

      if (this.verts.length >= this.length) {
        for (i = 0; i < this.verts.length - 1; i++) {
          const p1 = particles[this.verts[i]],
            p2 = particles[this.verts[i + 1]],
            dx = p1.x - p2.x,
            dy = p1.y - p2.y,
            dist = Math.sqrt(dx * dx + dy * dy);

          this.distances.push(dist);
        }

        this.stage = 1;
      }
      break;

    case 1:
      if (this.distances.length > 0) {
        points = [];

        for (i = 0; i < this.linked.length; i++) {
          p = particles[this.linked[i]];
          pos = position(p.x, p.y, p.z);
          points.push([pos.x, pos.y]);
        }

        const linkSpeedRel = linkSpeed * 0.00001 * canvas.width;
        this.traveled += linkSpeedRel;
        const d = this.distances[this.linked.length - 1];

        if (this.traveled >= d) {
          this.traveled = 0;

          this.linked.push(this.verts[this.linked.length]);
          p = particles[this.linked[this.linked.length - 1]];
          pos = position(p.x, p.y, p.z);
          points.push([pos.x, pos.y]);

          if (this.linked.length >= this.verts.length) {
            this.stage = 2;
          }
        } else {
          const a = particles[this.linked[this.linked.length - 1]],
            b = particles[this.verts[this.linked.length]],
            t = d - this.traveled,
            x = (this.traveled * b.x + t * a.x) / d,
            y = (this.traveled * b.y + t * a.y) / d,
            z = (this.traveled * b.z + t * a.z) / d;

          pos = position(x, y, z);
          points.push([pos.x, pos.y]);
        }

        this.drawLine(points);
      } else {
        this.stage = 3;
        this.finished = true;
      }
      break;

    case 2:
      if (this.verts.length > 1) {
        if (this.fade < linkFade) {
          this.fade++;

          points = [];
          const alpha = (1 - this.fade / linkFade) * linkOpacity;
          for (i = 0; i < this.verts.length; i++) {
            p = particles[this.verts[i]];
            pos = position(p.x, p.y, p.z);
            points.push([pos.x, pos.y]);
          }
          this.drawLine(points, alpha);
        } else {
          this.stage = 3;
          this.finished = true;
        }
      } else {
        this.stage = 3;
        this.finished = true;
      }
      break;

    case 3:
    default:
      this.finished = true;
      break;
  }
};

Link.prototype.drawLine = function (points, alpha) {
  if (points.length > 1 && alpha > 0) {
    context.globalAlpha = alpha;
    context.beginPath();
    for (let i = 0; i < points.length - 1; i++) {
      context.moveTo(points[i][0], points[i][1]);
      context.lineTo(points[i + 1][0], points[i + 1][1]);
    }
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.stroke();
    context.closePath();
    context.globalAlpha = 1;
  }
};

function noisePoint(i) {
  const a = nAngle * i,
    cosA = Math.cos(a),
    sinA = Math.sin(a),
    rad = nRad;
  return {
    x: rad * cosA,
    y: rad * sinA,
  };
}

function position(x, y, z) {
  return {
    x:
      x * canvas.width +
      (canvas.width / 2 - mouse.x + (nPos.x - 0.5) * noiseStrength) *
        z *
        motion,
    y:
      y * canvas.height +
      (canvas.height / 2 - mouse.y + (nPos.y - 0.5) * noiseStrength) *
        z *
        motion,
  };
}

function sizeRatio() {
  return canvas.width >= canvas.height ? canvas.width : canvas.height;
}

function random(min, max, float) {
  return float
    ? Math.random() * (max - min) + min
    : Math.floor(Math.random() * (max - min + 1)) + min;
}

init();
