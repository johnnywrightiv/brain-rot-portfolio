## 360° 3D “Brain Rot” Portfolio

Interactive WebGL/Three.js experiment that builds a 360° 3D animated “brain rot” style portfolio world inside a single-page Next.js app.

---

### Purpose

- **Showcase**: Example of a custom Three.js Web 3D experience for use in a portfolio.
- **Focus**: Camera systems, animated environment, and interactive experience design.

---

### Tech Stack

- **Framework**: Next.js (App Router)
- **3D Engine**: Three.js (WebGL)
- **Language**: TypeScript + React

---

### 3D Experience & Scene

- **360° environment**: Skybox / environment textures used to create a wrapped “world” effect.
- **Custom scene graph**: Multiple objects and “points of interest” arranged to feel like sections of a portfolio.
- **Animated elements**: Looping object motion and material/lighting animations for a “brain rot” visual style.

---

### Cameras & Interaction

- **Multiple camera perspectives**: Different camera positions/targets to frame separate objects/views.
- **Tour / walkthrough logic**: Programmatic transitions between camera states to simulate a guided tour.
- **Orbit / look-around controls**: User can look around the scene from key camera anchors (where supported).

---

### Running Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

---

### Live Demo

`https://brain-rot-portfolio.vercel.app/`

