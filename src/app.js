import { sections } from './content.js';
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  ConeGeometry,
  DirectionalLight,
  EdgesGeometry,
  FogExp2,
  Line,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';
const panel = document.querySelector('#detail-panel');
const panelContent = document.querySelector('#panel-content');
const status = document.querySelector('#scene-status');
let currentSection = null;
let focusObject = () => { };
let restoreCamera = () => { };
let lastTrigger;
function openSection(id, trigger) {
  const section = sections.find(item => item.id === id);
  if (!section) {
    return
  }
  currentSection = id;
  if (!panel.open) {
    lastTrigger = trigger || document.activeElement
  }
  document
    .querySelector('#panel-coordinate')
    .textContent = `OBJECT ${section
      .number} / ${section
        .name
        .toUpperCase()}`;
  panelContent.innerHTML = `
    <div class="panel-body">
      <div class="panel-shape" aria-hidden="true">${section.symbol}</div>
      <h2 id="panel-title">${section.title}</h2>
      <p class="panel-lead">${section.lead}</p>
      ${section.body}
    </div>
  `;
  document
    .querySelectorAll('.orbital-nav button')
    .forEach(button => {
      const active = button.dataset.open === id;
      button
        .classList
        .toggle('active', active);
      button.setAttribute('aria-pressed', String(active))
    });
  if (!panel.open) {
    panel.showModal()
  }
  panel.scrollTop = 0;
  focusObject(id);
  document
    .querySelector('#close-panel')
    .focus({ preventScroll: true })
}
document.addEventListener('click', event => {
  const trigger = event
    .target
    .closest('[data-open]');
  if (trigger) {
    openSection(trigger.dataset.open, trigger)
  }
});
document
  .querySelector('#close-panel')
  .addEventListener('click', () => panel.close());
panel.addEventListener('click', event => {
  if (event.target !== panel) {
    return
  }
  const bounds = panel.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
    panel.close()
  }
});
panel.addEventListener('close', () => {
  currentSection = null;
  document
    .querySelectorAll('.orbital-nav button')
    .forEach(button => {
      button
        .classList
        .remove('active');
      button.setAttribute('aria-pressed', 'false')
    });
  restoreCamera();
  lastTrigger
    ?.focus
    ?.({ preventScroll: true })
});
document
  .querySelector('#next-object')
  .addEventListener('click', () => {
    const index = sections.findIndex(section => section.id === currentSection);
    openSection(sections[(index + 1) % sections.length].id)
  });
document
  .querySelector('.brand')
  .addEventListener('click', event => {
    event.preventDefault();
    if (panel.open) {
      panel.close()
    }
    document
      .querySelector('#reset-view')
      .click()
  });
try {
  initializeUniverse()
} catch (error) {
  console.error('The 3D universe could not initialize:', error);
  status.textContent = '3D isn’t available on this device. Explore the sections below.';
  status.style.top = '60%';
  document
    .querySelector('.view-controls')
    .hidden = true;
  document
    .querySelector('#core-label')
    .hidden = true
}
function initializeUniverse() {
  const container = document.querySelector('#scene');
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x080b0d, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  container.appendChild(renderer.domElement);
  const scene = new Scene();
  scene.fog = new FogExp2(0x080b0d, 0.014);
  const camera = new PerspectiveCamera(container.clientWidth < 650
    ? 50
    : 42, container.clientWidth / container.clientHeight, 0.1, 180);
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = reducedQuery.matches;
  let paused = reduced;
  let visible = !document.hidden;
  let elapsed = 0;
  let previousTime = 0;
  let lastHover = null;
  const objects = [];
  const point = new Vector3();
  const center = new Vector3();
  const mobile = () => container.clientWidth < 650;
  const home = () => ({
    theta: 0.08,
    phi: mobile()
      ? 1.01
      : 1.02,
    distance: mobile()
      ? Math.max(31, 13.5 / (2 * Math.tan(MathUtils.degToRad(25)) * camera.aspect))
      : 20.5
  });
  let desired = home();
  const orbit = {
    ...desired
  };
  const look = new Vector3(-0.75, 1.25, 0);
  const lookTarget = look.clone();
  let beforeFocus = null;
  let velocityTheta = 0;
  let velocityPhi = 0;
  let hovered = null;
  const clamp = MathUtils.clamp;
  scene.add(new AmbientLight(0xc0d2e2, 1.6));
  const key = new DirectionalLight(0xe8f4ff, 5);
  key
    .position
    .set(-4, 7, 6);
  scene.add(key);
  const fill = new DirectionalLight(0x88aabc, 2.7);
  fill
    .position
    .set(5, 1, -4);
  scene.add(fill);
  const green = new PointLight(0xb9f976, 22, 12, 2);
  green
    .position
    .set(0, 1, 0);
  scene.add(green);
  let seed = 190926;
  function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296
  }
  const starCount = mobile()
    ? 650
    : 1250;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    starPositions[i * 3] = (random() - 0.5) * 95;
    starPositions[i * 3 + 1] = (random() - 0.5) * 65;
    starPositions[i * 3 + 2] = -12 - random() * 50;
    const intensity = 0.2 + random() * 0.55;
    starColors.set([
      intensity * 0.87,
      intensity * 0.95,
      intensity
    ], i * 3)
  }
  const starGeo = new BufferGeometry();
  starGeo.setAttribute('position', new BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new BufferAttribute(starColors, 3));
  scene.add(new Points(starGeo, new PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false })));
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 256;
  glowCanvas.height = 256;
  const context = glowCanvas.getContext('2d');
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(199,249,126,0.30)');
  gradient.addColorStop(0.23, 'rgba(155,205,86,0.13)');
  gradient.addColorStop(0.48, 'rgba(143,196,74,0.04)');
  gradient.addColorStop(1, 'rgba(102,175,55,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  const glow = new Sprite(new SpriteMaterial({ map: new CanvasTexture(glowCanvas), transparent: true, depthWrite: false, blending: AdditiveBlending }));
  glow
    .scale
    .set(9, 9, 1);
  scene.add(glow);
  const coreMaterial = new ShaderMaterial({
    uniforms: {
      uTime: {
        value: 0
      }
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vView;

        void main() {
          vNormal =
            normalize(
              normalMatrix * normal
            );

          vPosition = position;

          vec4 mv =
            modelViewMatrix *
            vec4(
              position,
              1.0
            );

          vView = -mv.xyz;

          gl_Position =
            projectionMatrix * mv;
        }
      `,
    fragmentShader: `
        uniform float uTime;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vView;

        float hash(vec3 p) {
          p = fract(
            p * .3183099 +
            vec3(.1,.2,.3)
          );

          p *= 17.;

          return fract(
            p.x *
            p.y *
            p.z *
            (
              p.x +
              p.y +
              p.z
            )
          );
        }

        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);

          f =
            f *
            f *
            (
              3. -
              2. * f
            );

          return mix(
            mix(
              mix(
                hash(i),
                hash(
                  i +
                  vec3(1,0,0)
                ),
                f.x
              ),
              mix(
                hash(
                  i +
                  vec3(0,1,0)
                ),
                hash(
                  i +
                  vec3(1,1,0)
                ),
                f.x
              ),
              f.y
            ),
            mix(
              mix(
                hash(
                  i +
                  vec3(0,0,1)
                ),
                hash(
                  i +
                  vec3(1,0,1)
                ),
                f.x
              ),
              mix(
                hash(
                  i +
                  vec3(0,1,1)
                ),
                hash(
                  i +
                  vec3(1,1,1)
                ),
                f.x
              ),
              f.y
            ),
            f.z
          );
        }

        void main() {
          vec3 n =
            normalize(vNormal);

          float rim =
            pow(
              1. -
              max(
                dot(
                  n,
                  normalize(vView)
                ),
                0.
              ),
              2.8
            );

          float cloudy =
            noise(
              vPosition * 5. +
              uTime * .012
            ) * .6 +
            noise(
              vPosition * 16.
            ) * .25 +
            noise(
              vPosition * 41.
            ) * .15;

          float bands =
            sin(
              vPosition.y *
              35. +
              cloudy *
              12.
            ) *
            .5 +
            .5;

          float illumination =
            max(
              dot(
                n,
                normalize(
                  vec3(
                    -.55,
                    .7,
                    .8
                  )
                )
              ),
              0.
            );

          vec3 color =
            vec3(
              .045,
              .065,
              .033
            ) +
            vec3(
              .14,
              .19,
              .07
            ) *
            cloudy *
            illumination +
            vec3(
              .035,
              .047,
              .01
            ) *
            bands;

          color +=
            vec3(
              .54,
              .8,
              .22
            ) *
            rim *
            .95;

          gl_FragColor =
            vec4(
              color,
              1.
            );
        }
      `
  });
  const core = new Mesh(new SphereGeometry(1.28, 80, 64), coreMaterial);
  core.rotation.z = -0.22;
  scene.add(core);
  const coreRing = new Mesh(new TorusGeometry(1.48, 0.012, 8, 180), new MeshBasicMaterial({ color: 0xc5ee90, transparent: true, opacity: 0.65 }));
  coreRing
    .rotation
    .set(1.22, 0.3, 0.18);
  scene.add(coreRing);
  function createOrbit(radius, tilt, color, opacity) {
    const curve = [];
    for (let i = 0; i <= 240; i += 1) {
      const angle = (i / 240) * Math.PI * 2;
      curve.push(new Vector3(Math.cos(angle) * radius, Math.sin(angle) * Math.sin(tilt) * radius, Math.sin(angle) * Math.cos(tilt) * radius * 0.82))
    }
    const line = new Line(new BufferGeometry().setFromPoints(curve), new LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
    scene.add(line);
    return line
  }
  createOrbit(3.65, 0.1, 0xabc1ba, 0.23);
  createOrbit(5.4, -0.1, 0x7b9799, 0.24);
  createOrbit(6.65, 0.2, 0x69828b, 0.17);
  createOrbit(8.1, 0.2, 0x65828b, 0.09);
  const ticks = [];
  for (let i = 0; i < 96; i += 1) {
    const angle = (i / 96) * Math.PI * 2;
    const radius = 6.65;
    const extension = i % 8 === 0
      ? 0.17
      : 0.055;
    for (const r of [radius,
      radius + extension]) {
      ticks.push(new Vector3(Math.cos(angle) * r, Math.sin(angle) * Math.sin(0.2) * r, Math.sin(angle) * Math.cos(0.2) * r * 0.82))
    }
  }
  scene.add(new LineSegments(new BufferGeometry().setFromPoints(ticks), new LineBasicMaterial({ color: 0x82969b, transparent: true, opacity: 0.3 })));
  const definitions = [
    {
      radius: 3.65,
      angle: 3.38,
      tilt: 0.1,
      size: 0.68,
      speed: 0.03,
      geometry: new ConeGeometry(0.78, 1.36, 3),
      rotation: [0.25, 0.3, -0.16]
    }, {
      radius: 5.4,
      angle: 5.95,
      tilt: -0.1,
      size: 0.74,
      speed: 0.021,
      geometry: new BoxGeometry(1.04, 1.04, 1.04),
      rotation: [0.42, 0.55, 0.24]
    }, {
      radius: 5.4,
      angle: 2.35,
      tilt: -0.1,
      size: 0.67,
      speed: 0.021,
      geometry: new OctahedronGeometry(0.77),
      rotation: [0.2, 0.2, -0.1]
    }, {
      radius: 6.65,
      angle: 0.86,
      tilt: 0.2,
      size: 0.7,
      speed: 0.015,
      geometry: new TorusGeometry(0.6, 0.19, 20, 64),
      rotation: [0.5, 0.45, 0.15]
    }
  ];
  sections.forEach((section, index) => {
    const def = definitions[index];
    const material = new MeshStandardMaterial({
      color: section.color,
      metalness: index === 0
        ? 0.56
        : 0.8,
      roughness: index === 0
        ? 0.31
        : 0.25,
      emissive: section.color,
      emissiveIntensity: 0.035
    });
    const mesh = new Mesh(def.geometry, material);
    mesh
      .rotation
      .set(...def.rotation);
    mesh.userData.section = section.id;
    scene.add(mesh);
    const outline = new LineSegments(new EdgesGeometry(def.geometry, 30), new LineBasicMaterial({ color: section.color, transparent: true, opacity: 0.3 }));
    mesh.add(outline);
    const label = document.createElement('button');
    label.className = 'object-label';
    label.dataset.open = section.id;
    label.setAttribute('aria-label', `Open ${section.name}`);
    label.innerHTML = `
        <span class="object-number">${section.number}</span>
        <span class="object-name">${section.name}</span>
        <span class="label-arrow" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.5 20.5L17 7M9 7H17V15" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </span>
      `;
    document
      .querySelector('#labels')
      .appendChild(label);
    label.addEventListener('mouseenter', () => {
      hovered = mesh
    });
    label.addEventListener('mouseleave', () => {
      hovered = null
    });
    label.addEventListener('focus', () => {
      hovered = mesh
    });
    label.addEventListener('blur', () => {
      hovered = null
    });
    objects.push({ mesh, label, section, def })
  });
  const satellites = [];
  for (let i = 0; i < 12; i += 1) {
    const mesh = new Mesh(new SphereGeometry(i % 3 === 0
      ? 0.04
      : 0.022, 6, 6), new MeshBasicMaterial({
        color: i % 3 === 0
          ? 0xc0d4b2
          : 0x678080
      }));
    scene.add(mesh);
    satellites.push({
      mesh,
      angle: random() * Math.PI * 2,
      radius: [3.65, 5.4, 6.65][i % 3],
      tilt: [0.1, -0.1, 0.2][i % 3]
    })
  }
  function positionOnOrbit(mesh, radius, angle, tilt) {
    mesh
      .position
      .set(Math.cos(angle) * radius, Math.sin(angle) * Math.sin(tilt) * radius, Math.sin(angle) * Math.cos(tilt) * radius * 0.82)
  }
  focusObject = id => {
    if (!beforeFocus) {
      beforeFocus = {
        ...desired
      }
    }
    const object = objects.find(item => item.section.id === id);
    if (object) {
      desired.distance = home().distance * 0.91;
      lookTarget
        .copy(object.mesh.position)
        .multiplyScalar(0.17);
      lookTarget.x += mobile()
        ? 0
        : 1.5;
      lookTarget.y += mobile()
        ? 2.3
        : 0.8
    }
  };
  restoreCamera = () => {
    if (beforeFocus) {
      desired = {
        ...beforeFocus
      };
      beforeFocus = null
    }
    lookTarget.set(mobile()
      ? 0
      : -0.75, mobile()
      ? 3.4
      : 1.25, 0)
  };
  function resetView() {
    desired = home();
    velocityTheta = 0;
    velocityPhi = 0;
    beforeFocus = null;
    lookTarget.set(mobile()
      ? 0
      : -0.75, mobile()
      ? 3.4
      : 1.25, 0)
  }
  document
    .querySelector('#reset-view')
    .addEventListener('click', resetView);
  const motionButton = document.querySelector('#toggle-motion');
  function updateMotion() {
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused
      ? 'Resume orbital motion'
      : 'Pause orbital motion');
    motionButton.title = paused
      ? 'Resume orbital motion'
      : 'Pause orbital motion';
    motionButton.innerHTML = paused
      ? `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 6 9 6-9 6Z"/>
          </svg>
        `
      : `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6v12M15 6v12"/>
          </svg>
        `
  }
  motionButton.addEventListener('click', () => {
    paused = !paused;
    updateMotion()
  });
  updateMotion();
  reducedQuery.addEventListener('change', event => {
    reduced = event.matches;
    paused = reduced;
    updateMotion()
  });
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    previousTime = 0
  });
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  function pick(event) {
    const rect = container.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return (raycaster.intersectObjects(objects.map(item => item.mesh), false)[0]
      ?.object || null)
  }
  const pointers = new Map();
  let press = null;
  let pinchDistance = 0;
  let wasMultitouch = false;
  renderer
    .domElement
    .addEventListener('pointerdown', event => {
      pointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY
      });
      renderer
        .domElement
        .setPointerCapture(event.pointerId);
      press = {
        x: event.clientX,
        y: event.clientY,
        moved: false
      };
      velocityTheta = 0;
      velocityPhi = 0;
      if (pointers.size > 1) {
        wasMultitouch = true;
        const values = [...pointers.values()];
        pinchDistance = Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y)
      } else {
        wasMultitouch = false
      }
    });
  renderer
    .domElement
    .addEventListener('pointermove', event => {
      const old = pointers.get(event.pointerId);
      if (old) {
        const dx = event.clientX - old.x;
        const dy = event.clientY - old.y;
        pointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY
        });
        if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 5) {
          press.moved = true
        }
        if (pointers.size === 2) {
          const values = [...pointers.values()];
          const distance = Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y);
          if (pinchDistance > 0) {
            desired.distance = clamp(desired.distance * pinchDistance / Math.max(distance, 1), 12, Math.max(38, home().distance * 1.4))
          }
          pinchDistance = distance
        } else {
          velocityTheta = -dx * 0.0035;
          velocityPhi = -dy * 0.0025;
          desired.theta += velocityTheta;
          desired.phi = clamp(desired.phi + velocityPhi, 0.3, 1.48)
        }
        renderer.domElement.style.cursor = 'grabbing'
      } else {
        hovered = pick(event);
        renderer.domElement.style.cursor = hovered
          ? 'pointer'
          : 'grab'
      }
    });
  renderer
    .domElement
    .addEventListener('pointerup', event => {
      if (press && !press.moved && !wasMultitouch) {
        const object = pick(event);
        if (object) {
          openSection(object.userData.section, objects.find(item => item.mesh === object).label)
        }
      }
      pointers.delete(event.pointerId);
      if (!pointers.size) {
        press = null
      }
      renderer.domElement.style.cursor = 'grab'
    });
  renderer
    .domElement
    .addEventListener('pointercancel', event => {
      pointers.delete(event.pointerId);
      press = null;
      velocityTheta = 0;
      velocityPhi = 0
    });
  renderer
    .domElement
    .addEventListener('pointerleave', () => {
      hovered = null
    });
  renderer
    .domElement
    .addEventListener('wheel', event => {
      event.preventDefault();
      desired.distance = clamp(desired.distance + event.deltaY * 0.012, 12, Math.max(38, home().distance * 1.4))
    }, { passive: false });
  renderer
    .domElement
    .addEventListener('webglcontextlost', event => {
      event.preventDefault();
      status.textContent = 'The 3D view was interrupted. You can still explore using the section buttons.';
      status.hidden = false
    });
  renderer
    .domElement
    .addEventListener('webglcontextrestored', () => {
      status.hidden = true
    });
  let wasMobile = mobile();
  const observer = new ResizeObserver(() => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.fov = mobile()
      ? 50
      : 42;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    if (wasMobile !== mobile()) {
      wasMobile = mobile();
      resetView()
    }
  });
  observer.observe(container);
  resetView();
  look.copy(lookTarget);
  function projectLabel(position, label, offsetY) {
    point
      .copy(position)
      .project(camera);
    const width = container.clientWidth;
    const height = container.clientHeight;
    const x = (point.x * 0.5 + 0.5) * width;
    const y = (-point.y * 0.5 + 0.5) * height + offsetY;
    const labelWidth = label.offsetWidth;
    label.style.transform = `translate(${clamp(x - labelWidth / 2, 12, width - labelWidth - 12)}px,${y}px)`;
    const inView = point.z > -1 && point.z < 1 && y > 76 && y < height - 160 && x > -40 && x < width + 40;
    label.style.visibility = inView
      ? 'visible'
      : 'hidden'
  }
  function frame(time) {
    requestAnimationFrame(frame);
    if (!visible) {
      return
    }
    const dt = previousTime
      ? Math.min((time - previousTime) / 1000, 0.04)
      : 0;
    previousTime = time;
    if (!paused && !panel.open && !hovered) {
      elapsed += dt
    }
    if (!pointers.size && !panel.open && !reduced) {
      desired.theta += velocityTheta * dt * 13;
      desired.phi = clamp(desired.phi + velocityPhi * dt * 13, 0.3, 1.48);
      const decay = Math.exp(-dt * 5);
      velocityTheta *= decay;
      velocityPhi *= decay
    }
    const damping = reduced
      ? 1
      : 1 - Math.exp(-dt * 6.5);
    orbit.theta += (desired.theta - orbit.theta) * damping;
    orbit.phi += (desired.phi - orbit.phi) * damping;
    orbit.distance += (desired.distance - orbit.distance) * damping;
    look.lerp(lookTarget, damping);
    camera
      .position
      .set(Math.sin(orbit.theta) * Math.sin(orbit.phi) * orbit.distance, Math.cos(orbit.phi) * orbit.distance, Math.cos(orbit.theta) * Math.sin(orbit.phi) * orbit.distance);
    camera.lookAt(look);
    camera.updateMatrixWorld();
    coreMaterial.uniforms.uTime.value = elapsed;
    core.rotation.y = elapsed * 0.027;
    objects.forEach(({
      mesh,
      label,
      def
    }, index) => {
      const angle = def.angle + elapsed * def.speed;
      positionOnOrbit(mesh, def.radius, angle, def.tilt);
      mesh.position.y += Math.sin(elapsed * 0.65 + index * 2) * 0.1;
      mesh.rotation.y = def.rotation[1] + elapsed * (index === 3
        ? 0.12
        : 0.085);
      mesh.rotation.z = def.rotation[2] + Math.sin(elapsed * 0.3 + index) * 0.09;
      const active = mesh === hovered || mesh.userData.section === currentSection;
      const scale = active
        ? 1.13
        : 1;
      mesh
        .scale
        .lerp(center.setScalar(scale), damping);
      mesh.material.emissiveIntensity += ((active
        ? 0.16
        : 0.035) - mesh.material.emissiveIntensity) * damping;
      label
        .classList
        .toggle('hovered', active);
      projectLabel(mesh.position, label, mobile()
        ? 28
        : 43)
    });
    satellites.forEach((item, index) => positionOnOrbit(item.mesh, item.radius, item.angle + elapsed * (0.018 + index * 0.002), item.tilt));
    projectLabel(new Vector3(0, -1.4, 0), document.querySelector('#core-label'), 30);
    renderer.render(scene, camera);
    if (status.hidden === false && renderer.info.render.calls > 0) {
      status.hidden = true
    }
  }
  renderer.domElement.style.cursor = 'grab';
  status.hidden = true;
  requestAnimationFrame(frame)
}
