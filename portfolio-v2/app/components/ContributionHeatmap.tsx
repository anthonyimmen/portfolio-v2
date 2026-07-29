import ContributionGrid from "./ContributionGrid";
import { GITHUB_USERNAME, getContributionCalendar } from "../lib/githubContributions";

const profileUrl = `https://github.com/${GITHUB_USERNAME}`;

export default async function ContributionHeatmap() {
  const calendar = await getContributionCalendar();

  return (
    <section id="activity" className="section">
      <h2 className="section-title">- commit activity -</h2>
      {calendar ? (
        <>
          <p>
            {calendar.total.toLocaleString()} contributions on{" "}
            <a
              className="accent-underline"
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
            >
              github
            </a>{" "}
            over the last year.
          </p>
          <div
            className="heatmap"
            role="img"
            aria-label={`GitHub contribution heatmap: ${calendar.total} contributions over the last year`}
          >
            <ContributionGrid weeks={calendar.weeks} />
            <div className="heatmap-legend" aria-hidden="true">
              <span>less</span>
              <span className="heatmap-cell" data-level="0" />
              <span className="heatmap-cell" data-level="1" />
              <span className="heatmap-cell" data-level="2" />
              <span className="heatmap-cell" data-level="3" />
              <span className="heatmap-cell" data-level="4" />
              <span>more</span>
            </div>
          </div>
        </>
      ) : (
        <p>
          my commit history lives on{" "}
          <a
            className="accent-underline"
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
          >
            github
          </a>
          .
        </p>
      )}
    </section>
  );
}
