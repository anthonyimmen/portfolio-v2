import ThemeToggle from "./components/ThemeToggle";
import TopMenu from "./components/TopMenu";

// TODO: add smooth animation for text to appear

export default function Home() {
  return (
    <div className="page">
      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <img src="/portfolio-logo.svg" alt="Portfolio logo" className="brand-logo" />
            <span>Anthony Immenschuh</span>
          </div>
          <div className="top-actions">
            <ThemeToggle />
            <TopMenu />
          </div>
        </header>

        <main className="main">
          <h1 className="hero">
            hey, <strong>i&apos;m anthony</strong>.<br />
            a full-stack software engineer at{" "}
            <a
              className="accent-underline"
              href="https://www.jpmorganchase.com"
              target="_blank"
              rel="noreferrer"
            >
              JPMorganChase
            </a>{" "}
            with 2.5+ years of experience building production systems with a focus on clarity, reliability, and user experience.
          </h1>

          <hr className="divider" />

          <section id="about" className="section">
            <h2 className="section-title">- about -</h2>
            <p>
              at JPMorganChase, i&apos;ve worked in the account opening and
              acquisitions space for{" "}
              <a
                className="accent-underline"
                href="https://www.chase.com/business"
                target="_blank"
                rel="noreferrer"
              >
                chase.com/business
              </a>
              , contributing across both frontend and backend systems that
              support core application workflows.
            </p>
            <p>
              i&apos;m comfortable moving across the stack and shipping
              end-to-end features, from clean, user-facing interfaces to backend
              services that power them.
            </p>
            <p>
              i&apos;m currently pursuing a part-time MS in computer science at
              the university of texas at austin, while working full-time.
            </p>
          </section>

          <hr className="divider" />

          <section className="section">
            <h2 className="section-title">- technologies i work with -</h2>
            <p>
              typescript, javascript, react, python, java, spring boot, node.js,
              sql, aws, c, c++, figma
            </p>
            <p>
              i care deeply about clarity in design, building interfaces that
              are minimal, intuitive, and effective, while still driving real
              business outcomes.
            </p>
          </section>

          <hr className="divider" />

          <section id="projects" className="section">
            <h2 className="section-title">- projects -</h2>
            <div className="projects">
              <div>
                <a
                  className="project-link"
                  href="https://www.ascii-it.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="project-link-text">ascii-it</span>
                  <i className="ph ph-arrow-up-right" />
                </a>
                <p>
                  a simple, intuitive tool for converting images into ascii
                  art. includes support for converting twitter / x profile
                  images and banners.
                </p>
              </div>
              <div>
                <a
                  className="project-link"
                  href="https://www.goalapp.io"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="project-link-text">goal</span>
                  <i className="ph ph-arrow-up-right" />
                </a>
                <p>
                  a single-task task manager built around one idea: focus beats
                  overload. instead of juggling lists, users commit to one task
                  at a time to increase follow-through. built as a react native
                  application.
                </p>
              </div>
              <div>
                <a
                  className="project-link"
                  href="https://www.anthonyimmenschuh.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="project-link-text">this site</span>
                  <i className="ph ph-arrow-up-right" />
                </a>
                <p>
                  my personal space, intentionally minimal, text-first, and
                  AI-integrated.
                </p>
              </div>
            </div>
          </section>

          <hr className="divider" />

          <section id="contact" className="section">
            <h2 className="section-title">- contact -</h2>
            <p>
              i&apos;m always open to conversations about new projects, creative
              ideas, feedback on my work, or professional opportunities.
            </p>
            <p>
              reach me via any of the socials below, or email me directly at{" "}
              <a href="mailto:anthonyimmen279@gmail.com">
                anthonyimmen279@gmail.com
              </a>
              .
            </p>
            <div className="socials">
              <a href="https://x.com/anthonyimmen" target="_blank" rel="noreferrer" aria-label="Twitter">
                <i className="ph ph-x-logo" />
              </a>
              <a href="https://github.com/anthonyimmen" target="_blank" rel="noreferrer" aria-label="GitHub">
                <i className="ph ph-github-logo" />
              </a>
              <a href="https://www.linkedin.com/in/anthony-immenschuh/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <i className="ph ph-linkedin-logo" />
              </a>
            </div>
          </section>
        </main>

        {/* <aside id="chat" className="chat-card card">
          <div className="chat-header">
            <span>Chat</span>
            <button className="icon-button" type="button" aria-label="Chat settings">
              <i className="ph ph-gear-six" />
            </button>
          </div>
          <div className="chat-body">
            <div className="chat-bubble">
              hey, i&apos;m gpt 4.1 nano trained to act like anthony.
            </div>
            <div className="chat-bubble">
              ask me anything about my experiences, projects, art, music,
              coffee, etc.
            </div>
            <div className="chat-meta">anthony-bot · 12:57pm</div>
            <div className="chat-bubble">
              what is your most impactful project?
            </div>
            <div className="chat-meta muted">you · 12:59pm</div>
            <div className="chat-bubble">
              towards late 2024 and early 2025, i worked on a React hook for
              verifying that businesses were not fraudulent. this hook was a
              part of our fraud overhaul initiative and it reduced customer
              timeouts and increases our accuracy in error reporting by 30%.
            </div>
            <div className="chat-meta">anthony-bot · 1:00pm</div>
          </div>
          <div className="chat-input">
            <input type="text" placeholder="craft a message..." />
            <button className="send-button" type="button" aria-label="Send message">
              <i className="ph ph-arrow-up" />
            </button>
          </div>
        </aside> */}
        <div id="chat" className="chat-anchor" />
      </div>

      {/* <button className="chat-fab" type="button" aria-label="Open chat">
        <i className="ph-thin ph-chat-text"/>
      </button> */}
    </div>
  );
}
