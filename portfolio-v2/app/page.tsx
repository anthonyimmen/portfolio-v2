import ChatWidget from "./components/ChatWidget";
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
              , contributing across frontend and backend systems that support
              core application workflows.
            </p>
            <p>
              today, i'm on the application platform side for chase, i build
              backend applications for foreign credit checks in digital account
              opening, services that support in-branch account opening, and
              AI/ML tools.
            </p>
            <p>
              across the stack, i ship end-to-end features, from clean
              user-facing interfaces to reliable backend services.
            </p>
            <p>
              alongside full-time work, i&apos;m pursuing a part-time MS in
              computer science at the university of texas at austin.
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

        <ChatWidget />
      </div>
    </div>
  );
}
