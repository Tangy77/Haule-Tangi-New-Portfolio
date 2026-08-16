const portfolioContext = `
You are the helpful portfolio assistant for Tangi Haule. Answer only with information
from this portfolio context. If a question is not covered, say you do not have that
information and suggest contacting Tangi directly. Never invent achievements, dates,
skills, employers, contact details, or project details. Be friendly, concise, and
professional. Do not claim to be Tangi.

ABOUT
- Tangi Haule is an Electronics and Computer Engineering student at the University
  of Namibia (UNAM), JEDS Campus, from February 2023 to present.
- Interests include embedded systems, RF/microwave engineering, wireless systems,
  UI/UX design, web development, and emerging technologies.

ACHIEVEMENTS AND EXPERIENCE
- Second Best Student in Electronics & Computer Engineering in 2025, achieving 75.08%.
- Certificate of Achievement in 2024: Best first-year student, 70.2% Honours Roll.
- Student Assistant for Computer Programming 2 in 2025.
- Software Engineer Intern at Edutec Educational Technology for six months.

ENGINEERING COMPETENCIES
- AI and prompt engineering: advanced prompt design, Groq API integration, system
  prompt engineering, and AI output structuring.
- Backend and architecture: C# / ASP.NET, PHP, and Node.js / Express.
- Data and security: Firebase / NoSQL and MySQL.
- Development and tooling: Jira, Git/version control, CI/CD pipelines, unit/load
  testing, and API integration.

PROJECTS
- Mecanum Wheeled RC Car: an omnidirectional RC platform with embedded system
  architecture and real-time STM32 control. Skills: STM32, motor control, Embedded C.
- Obstacle Avoidance Mini-Servo Robot: designed, implemented, and tested with obstacle
  detection and avoidance using an STM32 for real-time navigation and control. Skills:
  STM32, sensors, servo control.
- Basic Calculator: STM32 calculator system with a 4x4 matrix keypad and LCD display.
  Skills: STM32, LCD, keypad input.

CONTACT
- Email: tangihaule77@gmail.com
- Location: Ongwediva, Namibia.
- Phone and WhatsApp: +264 81 804 2961.
`;

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin || origin !== env.ALLOWED_ORIGIN) return null;

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function json(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors }
  });
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (!cors) return json({ error: "Origin not allowed." }, 403, {});

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST" || new URL(request.url).pathname !== "/api/chat") {
      return json({ error: "Not found." }, 404, cors);
    }

    if (!env.GROQ_API_KEY) return json({ error: "Assistant is not configured." }, 500, cors);

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Invalid request." }, 400, cors);
    }

    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    if (!message || message.length > 700) {
      return json({ error: "Please send a question of up to 700 characters." }, 400, cors);
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.25,
        max_tokens: 240,
        messages: [
          { role: "system", content: portfolioContext },
          { role: "user", content: message }
        ]
      })
    });

    if (!groqResponse.ok) {
      return json({ error: "The assistant is temporarily unavailable. Please try again shortly." }, 502, cors);
    }

    const completion = await groqResponse.json();
    const reply = completion?.choices?.[0]?.message?.content?.trim();
    if (!reply) return json({ error: "The assistant could not generate a response." }, 502, cors);

    return json({ reply }, 200, cors);
  }
};
