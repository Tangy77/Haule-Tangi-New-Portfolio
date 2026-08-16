/* ---------- Mobile menu ---------- */
const sidemenu = document.getElementById("sidemenu");
function openmenu(){ sidemenu.style.right = "0"; }
function closemenu(){ sidemenu.style.right = "-260px"; }

/* ---------- Animated signal field ---------- */
function createAmbientBackground(){
  const canvas = document.createElement("canvas");
  canvas.id = "ambient-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const context = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let stars = [];

  function resize(){
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    stars = Array.from({ length: Math.min(42, Math.max(20, Math.floor(width / 30))) }, (_, index) => ({
      x: (index * 97 % 997) / 997,
      y: (index * 211 % 991) / 991,
      drift: 0.25 + (index % 7) * 0.07,
      phase: index * 0.83
    }));
  }

  function spherePoint(longitude, latitude, rotation, radius, centerX, centerY){
    const x = Math.cos(latitude) * Math.cos(longitude + rotation);
    const y = Math.sin(latitude);
    const z = Math.cos(latitude) * Math.sin(longitude + rotation);
    const scale = 0.82 + (z + 1) * 0.16;
    return { x: centerX + x * radius * scale, y: centerY + y * radius * scale, z };
  }

  function drawSphere(time){
    const radius = Math.min(250, Math.max(116, width * 0.185));
    const centerX = Math.min(width * 0.76, width - radius * 0.53);
    const centerY = Math.max(210, Math.min(height * 0.4, height - radius * 0.7));
    const rotation = time * 0.00016;

    context.save();
    context.shadowColor = "rgba(57, 255, 20, 0.8)";
    context.shadowBlur = 10;
    context.lineWidth = 1;
    context.strokeStyle = "rgba(65, 255, 65, 0.52)";

    for (let latitude = -1.35; latitude <= 1.35; latitude += 0.26){
      context.beginPath();
      for (let longitude = 0; longitude <= Math.PI * 2.02; longitude += 0.08){
        const point = spherePoint(longitude, latitude, rotation, radius, centerX, centerY);
        if (longitude === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      }
      context.stroke();
    }

    for (let longitude = 0; longitude < Math.PI * 2; longitude += Math.PI / 9){
      context.beginPath();
      for (let latitude = -Math.PI / 2; latitude <= Math.PI / 2; latitude += 0.06){
        const point = spherePoint(longitude, latitude, rotation, radius, centerX, centerY);
        if (latitude <= -Math.PI / 2 + 0.061) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      }
      context.stroke();
    }

    context.shadowBlur = 0;
    context.strokeStyle = "rgba(113, 255, 103, 0.8)";
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(centerX, centerY, radius * 0.98, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  function drawGrid(time){
    const horizon = Math.max(250, height * 0.45);
    const vanishX = width * 0.54;
    const bottom = height + 80;
    context.save();
    context.lineWidth = 1;
    context.strokeStyle = "rgba(43, 230, 75, 0.22)";

    for (let x = -width; x <= width * 2; x += Math.max(80, width / 15)){
      context.beginPath();
      context.moveTo(vanishX + (x - vanishX) * 0.03, horizon);
      context.lineTo(x, bottom);
      context.stroke();
    }
    for (let row = 0; row < 11; row++){
      const progress = row / 10;
      const y = horizon + Math.pow(progress, 1.75) * (bottom - horizon);
      context.globalAlpha = 0.35 + progress * 0.65;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    stars.forEach((star, index) => {
      const x = star.x * width + Math.sin(time * 0.00025 * star.drift + star.phase) * 20;
      const y = horizon + star.y * (height - horizon);
      const size = 1.25 + Math.sin(time * 0.002 + star.phase) * 0.45;
      context.globalAlpha = 0.42 + (index % 4) * 0.1;
      context.fillStyle = "#4dff42";
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fill();
    });
    context.restore();
  }

  function drawNetwork(time){
    const points = [
      [0.10, 0.34], [0.20, 0.29], [0.29, 0.38], [0.37, 0.27], [0.45, 0.33],
      [0.53, 0.25], [0.60, 0.36], [0.49, 0.43], [0.33, 0.48]
    ].map(([x, y], index) => ({
      x: x * width + Math.sin(time * 0.00055 + index) * 12,
      y: y * height + Math.cos(time * 0.00045 + index * 1.8) * 8
    }));
    const connections = [[0,1],[1,2],[1,3],[2,4],[3,4],[3,5],[4,6],[2,7],[7,8],[8,0]];
    context.save();
    context.strokeStyle = "rgba(57, 255, 72, 0.22)";
    context.lineWidth = 1;
    connections.forEach(([from, to]) => {
      context.beginPath();
      context.moveTo(points[from].x, points[from].y);
      context.lineTo(points[to].x, points[to].y);
      context.stroke();
    });
    context.fillStyle = "#4dff42";
    points.forEach(point => {
      context.shadowColor = "#39ff14";
      context.shadowBlur = 8;
      context.beginPath();
      context.arc(point.x, point.y, 2, 0, Math.PI * 2);
      context.fill();
    });
    context.restore();
  }

  function render(time = 0){
    context.clearRect(0, 0, width, height);
    drawGrid(time);
    drawNetwork(time);
    drawSphere(time);
    if (!reducedMotion) window.requestAnimationFrame(render);
  }

  resize();
  render();
  window.addEventListener("resize", () => { resize(); if (reducedMotion) render(); }, { passive: true });
}
createAmbientBackground();

/* ---------- Tabs (About page) ---------- */
function opentab(tabname, evt){
  document.querySelectorAll(".tab-links").forEach(el => el.classList.remove("active-link"));
  document.querySelectorAll(".tab-contents").forEach(el => el.classList.remove("active-tab"));
  evt.currentTarget.classList.add("active-link");
  document.getElementById(tabname).classList.add("active-tab");
}

/* ---------- Scroll progress: signal rail + top bar ---------- */
function updateScrollProgress(){
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;

  const railFill = document.querySelector("#signal-rail .rail-fill");
  const railPulse = document.querySelector("#signal-rail .rail-pulse");
  if (railFill && railPulse){
    railFill.style.height = pct + "%";
    railPulse.style.top = pct + "%";
  }
  const topProgress = document.getElementById("top-progress");
  if (topProgress){ topProgress.style.width = pct + "%"; }
}
window.addEventListener("scroll", updateScrollProgress, { passive:true });
window.addEventListener("resize", updateScrollProgress);

/* ---------- Reveal on scroll ---------- */
const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealItems.forEach(el => revealObserver.observe(el));

/* ---------- Footer year ---------- */
document.querySelectorAll(".year").forEach(el => { el.textContent = new Date().getFullYear(); });

/* ---------- Contact form submission ---------- */
const scriptURL = 'https://script.google.com/macros/s/AKfycbwPnLX43g-JtDQxQBkJUqq9DnfRZ1e3DfSTxlmWiNxqhgf-WdNo_sl7ET7ZiWrh15-8/exec';
const form = document.forms['contact-form'];
if (form){
  const msg = document.getElementById("msg");
  form.addEventListener('submit', e => {
    e.preventDefault();
    msg.textContent = "Sending...";
    fetch(scriptURL, { method: 'POST', body: new FormData(form) })
      .then(response => response.json())
      .then(() => {
        msg.textContent = "Message sent successfully — thank you!";
        setTimeout(() => { msg.textContent = ""; }, 5000);
        form.reset();
      })
      .catch(error => {
        msg.textContent = "Something went wrong. Please try again.";
        console.error('Error!', error.message);
      });
  });
}

/* ---------- Ask Tangi assistant ---------- */
function initPortfolioAssistant(){
  const assistant = document.createElement("aside");
  assistant.className = "portfolio-assistant";
  assistant.innerHTML = `
    <button class="assistant-launcher" type="button" aria-label="Open Ask Tangi assistant" aria-expanded="false">
      <i class="fa-solid fa-sparkles"></i><span>Ask Tangi</span>
    </button>
    <section class="assistant-panel" aria-label="Ask Tangi assistant" aria-hidden="true">
      <header class="assistant-header">
        <div><span class="assistant-kicker"><i class="fa-solid fa-circle"></i> Portfolio AI</span><h2>Ask Tangi</h2></div>
        <button class="assistant-close" type="button" aria-label="Close assistant"><i class="fa-solid fa-xmark"></i></button>
      </header>
      <div class="assistant-messages" aria-live="polite">
        <div class="assistant-message assistant-message-bot">Hi, I’m Tangi’s portfolio assistant. Ask me about skills, projects, experience, or achievements.</div>
      </div>
      <div class="assistant-suggestions" aria-label="Suggested questions">
        <button type="button">What projects has Tangi built?</button>
        <button type="button">What are Tangi’s skills?</button>
      </div>
      <form class="assistant-form">
        <label class="sr-only" for="assistant-question">Ask a question about Tangi</label>
        <input id="assistant-question" name="question" maxlength="700" autocomplete="off" placeholder="Ask about Tangi's work..." required>
        <button type="submit" aria-label="Send question"><i class="fa-solid fa-arrow-up"></i></button>
      </form>
      <p class="assistant-note">Answers are based on this portfolio.</p>
    </section>`;
  document.body.append(assistant);

  const launcher = assistant.querySelector(".assistant-launcher");
  const panel = assistant.querySelector(".assistant-panel");
  const closeButton = assistant.querySelector(".assistant-close");
  const form = assistant.querySelector(".assistant-form");
  const input = assistant.querySelector("input");
  const messages = assistant.querySelector(".assistant-messages");
  const endpoint = window.PORTFOLIO_ASSISTANT_CONFIG?.endpoint?.trim();

  function setOpen(open){
    assistant.classList.toggle("is-open", open);
    launcher.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    if (open) input.focus();
  }

  function addMessage(text, type){
    const message = document.createElement("div");
    message.className = `assistant-message assistant-message-${type}`;
    message.textContent = text;
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
    return message;
  }

  launcher.addEventListener("click", () => setOpen(!assistant.classList.contains("is-open")));
  closeButton.addEventListener("click", () => setOpen(false));
  assistant.querySelectorAll(".assistant-suggestions button").forEach(button => {
    button.addEventListener("click", () => {
      input.value = button.textContent;
      form.requestSubmit();
    });
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    addMessage(question, "user");
    input.value = "";
    input.disabled = true;
    const submitButton = form.querySelector("button");
    submitButton.disabled = true;
    const pending = addMessage("Thinking…", "bot is-thinking");

    if (!endpoint || endpoint.includes("YOUR-WORKER")) {
      pending.textContent = "The assistant is being connected. Please check back shortly.";
      input.disabled = false;
      submitButton.disabled = false;
      input.focus();
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question })
      });
      const data = await response.json();
      pending.textContent = response.ok ? data.reply : (data.error || "I couldn’t answer that just now.");
    } catch {
      pending.textContent = "I couldn’t reach the assistant right now. Please try again shortly.";
    } finally {
      input.disabled = false;
      submitButton.disabled = false;
      input.focus();
    }
  });
}
initPortfolioAssistant();

/* init on load */
updateScrollProgress();
