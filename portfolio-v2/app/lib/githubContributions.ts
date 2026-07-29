export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type ContributionCalendar = {
  username: string;
  total: number;
  weeks: ContributionDay[][];
};

const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "anthonyimmen";
const REVALIDATE_SECONDS = 60 * 60;

const GRAPHQL_LEVELS: Record<string, ContributionDay["level"]> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const CONTRIBUTIONS_QUERY = `
  query Contributions($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

type GraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }>;
          }>;
        };
      };
    };
  };
};

/**
 * The GraphQL API is the documented source, but it needs a token. A token with
 * no scopes is enough for public contribution counts.
 */
async function fetchFromGraphQL(username: string): Promise<ContributionCalendar | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: { login: username },
    }),
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as GraphQLResponse;
  const calendar =
    payload.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) return null;

  const weeks = calendar.weeks.map((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: GRAPHQL_LEVELS[day.contributionLevel] ?? 0,
    })),
  );

  return { username, total: calendar.totalContributions, weeks };
}

/**
 * Fallback for when no token is configured: the profile calendar fragment that
 * github.com serves publicly. Counts live in `data-count` on older markup and
 * in the paired `<tool-tip>` element on newer markup, so both are read.
 */
async function fetchFromProfile(username: string): Promise<ContributionCalendar | null> {
  const response = await fetch(
    `https://github.com/users/${encodeURIComponent(username)}/contributions`,
    {
      headers: {
        Accept: "text/html",
        "User-Agent": "anthonyimmenschuh.com",
        "X-Requested-With": "XMLHttpRequest",
      },
      next: { revalidate: REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) return null;
  const html = await response.text();

  const tooltipCounts = new Map<string, number>();
  const tooltipPattern = /<tool-tip[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g;
  for (const match of html.matchAll(tooltipPattern)) {
    const leading = match[2].trim().match(/^(\d[\d,]*)/);
    tooltipCounts.set(match[1], leading ? Number(leading[1].replace(/,/g, "")) : 0);
  }

  const days: ContributionDay[] = [];
  const dayPattern = /<td[^>]*class="[^"]*ContributionCalendar-day[^"]*"[^>]*>/g;
  for (const match of html.matchAll(dayPattern)) {
    const tag = match[0];
    const date = tag.match(/data-date="([^"]+)"/)?.[1];
    if (!date) continue;

    const id = tag.match(/id="([^"]+)"/)?.[1];
    const inlineCount = tag.match(/data-count="(\d+)"/)?.[1];
    const count =
      inlineCount !== undefined
        ? Number(inlineCount)
        : (id ? tooltipCounts.get(id) : undefined) ?? 0;
    const level = Number(tag.match(/data-level="(\d)"/)?.[1] ?? 0);

    days.push({
      date,
      count,
      level: (Math.min(Math.max(level, 0), 4) as ContributionDay["level"]),
    });
  }

  if (days.length === 0) return null;

  days.sort((a, b) => a.date.localeCompare(b.date));

  // Re-chunk into calendar columns so the first row is always Sunday.
  const weeks: ContributionDay[][] = [];
  let current: ContributionDay[] = [];
  for (const day of days) {
    if (new Date(`${day.date}T00:00:00Z`).getUTCDay() === 0 && current.length > 0) {
      weeks.push(current);
      current = [];
    }
    current.push(day);
  }
  if (current.length > 0) weeks.push(current);

  const total = days.reduce((sum, day) => sum + day.count, 0);

  return { username, total, weeks };
}

export async function getContributionCalendar(
  username: string = GITHUB_USERNAME,
): Promise<ContributionCalendar | null> {
  try {
    return (await fetchFromGraphQL(username)) ?? (await fetchFromProfile(username));
  } catch {
    return null;
  }
}

export { GITHUB_USERNAME };
