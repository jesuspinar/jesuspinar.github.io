// Profile URLs here.
const LINKEDIN_URL = 'https://linkedin.com/in/jesuspinarl';
const GITHUB_URL = 'http://github.com/jesuspinar';

const socialItem = (label, url) =>
  url
    ? `<a class="tag" href="${url}" target="_blank" rel="noreferrer">${label} ↗</a>`
    : `<span class="tag">${label}</span>`;

export const sections = [
  {
    id: 'profile',
    name: 'Profile',
    symbol: '△',
    color: 0xc9f88a,
    number: '01',
    title: 'Senior Full Stack Developer.<br>Front to back.',
    lead: 'I build maintainable web applications across front-end and back-end systems.',
    body: `
      <p>I’m <strong>Jesus Pinar</strong>, a Senior Full Stack Developer with professional experience across Java, Spring Boot, Angular, React, TypeScript, SQL, and modern web development.</p>
      <p>I’m experienced in software design and in translating functional specifications into reliable, maintainable implementations. My work spans scalable back-end services, reusable front-end components, authentication, testing, databases, CI/CD, and team collaboration.</p>
    `
  },
  {
    id: 'experience',
    name: 'Experience',
    symbol: '◇',
    color: 0xd6e4f1,
    number: '02',
    title: 'Professional<br>experience.',
    lead: 'Building production software across enterprise front-end and back-end systems.',
    body: `
      <article class="project-card">
        <h3>INDRA · Spain <span>01</span></h3>
        <p><strong>Full Stack Developer</strong> · Remote</p>
        <p>• Implemented authentication and authorization systems using OAuth.</p>
        <p>• Developed scalable microservices with Java and Spring Boot, following back-end architecture best practices.</p>
        <p>• Built reusable, maintainable components with Angular 17+, optimizing front-end performance.</p>
        <p>• Collaborated with the team to integrate services and meet technical requirements.</p>
        <small>MARCH 2025 — JULY 2026</small>
      </article>

      <article class="project-card">
        <h3>NTT DATA · Spain <span>02</span></h3>
        <p><strong>Full Stack Developer</strong> · Hybrid</p>
        <p>• Performed development, debugging, and unit testing tasks in support of projects.</p>
        <p>• Developed scalable user interfaces and web components using React, Java, and Spring Boot.</p>
        <p>• Collaborated with team members to ensure sound design and essential functionality.</p>
        <small>JUNE 2023 — SEPTEMBER 2024</small>
      </article>
    `
  },
  {
    id: 'skills',
    name: 'Skills',
    symbol: '✧',
    color: 0x98b9ed,
    number: '03',
    title: 'The stack.<br>The workflow.',
    lead: 'A practical toolkit for building, shipping, and maintaining web applications.',
    body: `
      <h3>Front-end</h3>
      <div class="tags">
        <span class="tag">HTML5</span>
        <span class="tag">CSS</span>
        <span class="tag">JavaScript</span>
        <span class="tag">TypeScript</span>
        <span class="tag">React</span>
        <span class="tag">Angular</span>
        <span class="tag">Astro</span>
        <span class="tag">Material UI</span>
        <span class="tag">Figma</span>
      </div>

      <h3>Back-end & data</h3>
      <div class="tags">
        <span class="tag">Java</span>
        <span class="tag">Spring Boot</span>
        <span class="tag">Node.js</span>
        <span class="tag">Postgres SQL</span>
        <span class="tag">Oracle DB</span>
        <span class="tag">OAuth</span>
        <span class="tag">Microservices</span>
      </div>

      <h3>Tools & delivery</h3>
      <div class="tags">
        <span class="tag">Copilot</span>
        <span class="tag">Git</span>
        <span class="tag">Linux</span>
        <span class="tag">Docker</span>
        <span class="tag">CI/CD</span>
        <span class="tag">Jira</span>
      </div>

      <h3>Ways of working</h3>
      <div class="tags">
        <span class="tag">Agentic Development</span>
        <span class="tag">Agile methodologies</span>
        <span class="tag">Scrum</span>
        <span class="tag">Unit testing</span>
        <span class="tag">Teamwork</span>
        <span class="tag">Initiative</span>
        <span class="tag">Active listening</span>
        <span class="tag">English & Spanish</span>
      </div>
    `
  },
  {
    id: 'contact',
    name: 'Contact',
    symbol: '◎',
    color: 0xf0c59a,
    number: '04',
    title: 'Let’s build<br>something useful.',
    lead: 'Open to conversations about development, engineering, and new opportunities.',
    body: `
      <p>The fastest way to reach me is by <strong>email</strong> or LinkedIn.</p>

      <div class="contact-card">
        <span>EMAIL</span>
        <strong><a href="mailto:devjesuspinar@gmail.com">devjesuspinar@gmail.com</a></strong>
      </div>

      <h3>Online</h3>
      <div class="tags">
        ${socialItem('LinkedIn', LINKEDIN_URL)}
        ${socialItem('GitHub', GITHUB_URL)}
      </div>
    `
  }
];
