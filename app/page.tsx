import Link from "next/link";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="/">Engineering Education</Link>
        <nav aria-label="Primary navigation">
          <Link href="#tools">Tools</Link>
          <Link href="#publications">Publications</Link>
          <Link href="#about">About</Link>
        </nav>
      </header>

      <section className="hero">
        <p className="eyebrow">Tools for better learning</p>
        <h1>Practical resources for engineering educators.</h1>
        <p className="hero-copy">
          Thoughtful, browser-based tools for organizing learning experiences,
          supporting students, and making instructional work easier.
        </p>
        <Link className="primary-button" href="#tools">
          Explore tools <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="section" id="tools">
        <div className="section-heading">
          <p className="eyebrow">Featured tool</p>
          <h2>Start with a tool you can use today.</h2>
        </div>

        <article className="feature-card">
          <div>
            <p className="card-label">Team formation</p>
            <h3>Social Golfer Team Generator</h3>
            <p>
              Create repeated classroom teams while minimizing the number of
              students who are paired together more than once.
            </p>
            <Link className="secondary-button" href="/tools/team-generator">
              Open team generator <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ul className="feature-list" aria-label="Team generator features">
            <li>Paste names or upload a roster</li>
            <li>Choose team size and number of rounds</li>
            <li>Review repeated teammate pairings</li>
            <li>Export assignments as CSV</li>
          </ul>
        </article>
      </section>

      <section className="section quiet-section" id="publications">
        <div>
          <p className="eyebrow">In development</p>
          <h2>Community-engaged engineering publications</h2>
        </div>
        <p>
          A searchable, reviewed collection of scholarship on community-engaged
          engineering education is planned for a future release.
        </p>
      </section>

      <section className="section about-section" id="about">
        <p className="eyebrow">About</p>
        <h2>Built around real teaching needs.</h2>
        <p>
          This site collects focused resources that help engineering educators
          spend less time on repetitive setup and more time on meaningful
          learning.
        </p>
      </section>

      <footer>
        <span>Engineering Education</span>
        <span>Tools that support thoughtful teaching.</span>
      </footer>
    </main>
  );
}
