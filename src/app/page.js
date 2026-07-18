import { auth, signIn, signOut } from "@/auth";
import DateRangePicker from "./DateRangePicker";
import WrappedSlides from "./WrappedSlides";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "./supabaseClient";
import TimezoneDetector from "./TimezoneDetector";
import { cookies } from "next/headers";

  // Parses an ISO date string like "2026-07-06T14:30:00+05:30"
// and returns date/time components in the ORIGINAL commit's timezone,
// not the server's local timezone.
const IST_OFFSET_MINUTES = 5 * 60 + 30; // IST is UTC+5:30

function parseCommitDate(isoString, timezone) {
  const utcDate = new Date(isoString);
  if (isNaN(utcDate.getTime())) return null;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(utcDate);
  const get = (type) => parts.find((p) => p.type === type)?.value;

  const year = parseInt(get("year"));
  const month = parseInt(get("month"));
  const day = parseInt(get("day"));
  const hour = parseInt(get("hour"));
  const minute = parseInt(get("minute"));

  return {
    year,
    month,
    day,
    hour,
    minute,
    dateKey: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }),
    utcDateForCompare: new Date(Date.UTC(year, month - 1, day)),
  };
}

async function getRepos(accessToken) {
  const res = await fetch("https://api.github.com/user/repos?per_page=100", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  return res.json();
}

async function getPullRequestStats(accessToken, username, sinceDate, untilDate) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const url = `https://api.github.com/search/issues?q=author:${username}+type:pr&per_page=100`;

  const res = await fetch(url, { headers, cache: "no-store" });

  if (!res.ok) {
    return { totalPRs: 0, mergedPRs: 0, ownRepoPRs: 0, otherRepoPRs: 0, timeline: [] };
  }

  const data = await res.json();
  const prs = data.items || [];

  const filteredPRs = prs.filter((pr) => {
    const createdDate = new Date(pr.created_at);
    if (sinceDate && createdDate < sinceDate) return false;
    if (untilDate && createdDate >= untilDate) return false;
    return true;
  });

  let ownRepoPRs = 0;
  let otherRepoPRs = 0;
  let mergedPRs = 0;
  const prsByDay = {};

  filteredPRs.forEach((pr) => {
    const repoOwner = pr.repository_url.split("/").slice(-2, -1)[0];
    if (repoOwner.toLowerCase() === username.toLowerCase()) {
      ownRepoPRs++;
    } else {
      otherRepoPRs++;
    }

    if (pr.pull_request?.merged_at) {
      mergedPRs++;
    }

    const date = new Date(pr.created_at);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
    prsByDay[key] = (prsByDay[key] || 0) + 1;
  });

  const timeline = Object.entries(prsByDay)
    .map(([date, count]) => ({ date, prs: count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    totalPRs: filteredPRs.length,
    mergedPRs,
    ownRepoPRs,
    otherRepoPRs,
    timeline,
  };
}

async function getIssueStats(accessToken, username, sinceDate, untilDate) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const url = `https://api.github.com/search/issues?q=author:${username}+type:issue&per_page=100`;

  const res = await fetch(url, { headers, cache: "no-store" });

  if (!res.ok) {
    return { totalIssues: 0 };
  }

  const data = await res.json();
  const issues = data.items || [];

  const filteredIssues = issues.filter((issue) => {
    const createdDate = new Date(issue.created_at);
    if (sinceDate && createdDate < sinceDate) return false;
    if (untilDate && createdDate >= untilDate) return false;
    return true;
  });

  return { totalIssues: filteredIssues.length };
}

async function generateAIContent(stats, username, period, commitPersonality) {
  const fallback = {
    story: "Your coding journey continues, one commit at a time.",
    roast: "Even robots need more data to roast you properly.",
    hype: "A developer steadily building their craft.",
    quote: "Progress, not perfection.",
    archetype: "The Steady Builder",
  };

  // 1. Check cache first — but only trust it if commit count still matches
  const { data: cached } = await supabase
    .from("wrapped_cache")
    .select("*")
    .eq("github_username", username)
    .eq("period", period)
    .maybeSingle();

  if (cached && cached.commit_count_snapshot === stats.totalCommits) {
    return {
      story: cached.ai_story,
      roast: cached.ai_roast,
      hype: cached.ai_hype,
      quote: cached.ai_quote,
      archetype: cached.archetype,
    };
  }

  // If stale (commit count changed) or doesn't exist, delete old entry first
  if (cached) {
    await supabase
      .from("wrapped_cache")
      .delete()
      .eq("github_username", username)
      .eq("period", period);
  }
  
  // 2. Not cached — generate fresh
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    const prompt = `Based on these coding stats, generate a JSON object with exactly these 5 fields: "story" (2-3 warm, personal sentences about their coding year, no markdown), "roast" (1-2 savage, witty, playfully brutal sentences roasting a coding habit visible in the stats — think stand-up comedian energy or Chandler from friends energy or anyone funny and cool. Be specific and clever, not generic. And don't drop huge words/terms just to sound cool. Don't sound lame.), "hype" (1-2 sentences, professional LinkedIn-style hype about their achievement), "quote" (one short, memorable, quotable sentence summarizing their year), "archetype" (a 2-4 word developer personality label, like "Night Owl Builder" or "Consistency King", based on the stats).

Stats:
- Total commits: ${stats.totalCommits}
- Longest streak: ${stats.longestStreak} days
- Most active day: ${stats.mostActiveWeekday || "varied"}
- Most active hour: ${stats.mostActiveHour || "varied"}
- Weekday commits: ${stats.weekdayCommits}, Weekend commits: ${stats.weekendCommits}
- Top language: ${stats.topLanguage || "varied"}
- Lines added: ${stats.totalAdditions}

Respond with ONLY the raw JSON object, no markdown code fences, no extra text.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "");

    const parsed = JSON.parse(text);
    const content = { ...fallback, ...parsed };

    // 3. Save to cache for next time
    // 3. Save to cache for next time
    const { error: insertError } = await supabase.from("wrapped_cache").insert({
      github_username: username,
      period: period,
      ai_story: content.story,
      ai_roast: content.roast,
      ai_hype: content.hype,
      ai_quote: content.quote,
      archetype: content.archetype,
      commit_personality: commitPersonality,
      commit_count_snapshot: stats.totalCommits,
    });

    if (insertError) {
      console.error("Supabase insert failed:", insertError);
    } else {
      console.log("Supabase insert succeeded for", username, period);
    }

    return content;
  } catch (error) {
    console.error("AI content generation failed:", error);
    return fallback;
  }
}

function detectCommitPersonality(messages) {
  if (messages.length === 0) {
    return { label: "Blank Canvas", description: "No commits yet to analyze." };
  }

  const lower = messages.map((m) => m.toLowerCase());

  const fixCount = lower.filter((m) => m.includes("fix")).length;
  const finalCount = lower.filter((m) => m.includes("final")).length;
  const wipCount = lower.filter((m) => m.includes("wip")).length;
  const readmeCount = lower.filter((m) => m.includes("readme") || m.includes("docs")).length;
  const updateCount = lower.filter((m) => m.startsWith("update")).length;

  const total = messages.length;
  const scores = [
    { label: "Professional Bug Exorcist", score: fixCount / total, description: "You fix things. Then you fix the fix." },
    { label: "Version Naming Visionary", score: finalCount / total, description: "final, final2, final_final... a saga." },
    { label: "Optimistic Starter", score: wipCount / total, description: "Work in progress, forever in progress." },
    { label: "Documentation Defender", score: (readmeCount + updateCount) / total, description: "Someone has to keep the README alive." },
  ];

  const top = scores.sort((a, b) => b.score - a.score)[0];

  if (top.score < 0.15) {
    return { label: "The Balanced Coder", description: "No single obsession — just steady, varied work." };
  }

  return { label: top.label, description: top.description };
}

async function getCommitStats(accessToken, username, sinceDate, untilDate, timezone) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const reposRes = await fetch(
    "https://api.github.com/user/repos?per_page=100",
    { headers, cache: "no-store" }
  );
  const allRepos = await reposRes.json();
  const ownRepos = allRepos;
  let commitsByRepo = {};
  let linesByDate = [];
  let allMessages = [];
  let contributorsToYourRepos = new Set();

  for (const repo of ownRepos.slice(0, 20)) {
    const isMyOwnOriginalRepo = !repo.fork;
    const commitsRes = await fetch(
      `https://api.github.com/repos/${repo.full_name}/commits?per_page=100`,
      { headers, cache: "no-store" }
    );

    if (commitsRes.ok) {
      const commits = await commitsRes.json();
      if (Array.isArray(commits)) {
        const myCommits = commits.filter(
          (c) => c.author && c.author.login === username
        );

        if (isMyOwnOriginalRepo) {
          const othersCommits = commits.filter(
            (c) => c.author && c.author.login !== username
          );
          if (othersCommits.length > 0) {
            othersCommits.forEach((c) => {
              contributorsToYourRepos.add(c.author.login);
            });
          }
        }

        if (myCommits.length > 0) {
          commitsByRepo[repo.name] = myCommits.map((c) =>
            parseCommitDate(c.commit.author.date, timezone)
          ).filter(Boolean);

          myCommits.forEach((c) => {
            allMessages.push(c.commit.message);
          });

          for (const commit of myCommits) {
            const detailRes = await fetch(
              `https://api.github.com/repos/${repo.full_name}/commits/${commit.sha}`,
              { headers, cache: "no-store" }
            );
            if (detailRes.ok) {
              const detail = await detailRes.json();
              const parsed = parseCommitDate(commit.commit.author.date, timezone);
              if (parsed) {
                linesByDate.push({
                  parsed,
                  additions: detail.stats?.additions || 0,
                  deletions: detail.stats?.deletions || 0,
                });
              }
            }
          }
        }
      }
    }
  }

  let allCommits = Object.values(commitsByRepo).flat();

  const inRange = (parsed) => {
    if (sinceDate && parsed.utcDateForCompare < sinceDate) return false;
    if (untilDate && parsed.utcDateForCompare >= untilDate) return false;
    return true;
  };

  const filteredCommits = allCommits.filter(inRange);
  const filteredLines = linesByDate.filter((entry) => inRange(entry.parsed));

  const totalAdditions = filteredLines.reduce((sum, e) => sum + e.additions, 0);
  const totalDeletions = filteredLines.reduce((sum, e) => sum + e.deletions, 0);

  const touchedRepos = Object.entries(commitsByRepo)
    .filter(([repoName, parsedDates]) => parsedDates.some(inRange))
    .map(([repoName]) => repoName);

  const sortedCommits = filteredCommits.sort(
    (a, b) => a.utcDateForCompare - b.utcDateForCompare
  );

  const commitDays = [...new Set(sortedCommits.map((p) => p.dateKey))].sort();

  const commitsByDay = {};
  sortedCommits.forEach((p) => {
    commitsByDay[p.dateKey] = (commitsByDay[p.dateKey] || 0) + 1;
  });

  const timeline = Object.entries(commitsByDay)
    .map(([date, count]) => ({ date, commits: count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  let longestStreak = 0;
  let currentStreak = 0;
  let streak = 1;

  for (let i = 1; i < commitDays.length; i++) {
    const prev = new Date(commitDays[i - 1]);
    const curr = new Date(commitDays[i]);
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak++;
    } else {
      longestStreak = Math.max(longestStreak, streak);
      streak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, streak);

  let longestGap = 0;
  for (let i = 1; i < commitDays.length; i++) {
    const prev = new Date(commitDays[i - 1]);
    const curr = new Date(commitDays[i]);
    const gap = (curr - prev) / (1000 * 60 * 60 * 24) - 1;
    if (gap > longestGap) longestGap = gap;
  }

let forgivingStreak = 0;
  let forgivingSkippedDate = null;
  let currentForgiving = 1;
  let currentSkippedDate = null;
  let skipsUsed = 0;

  for (let i = 1; i < commitDays.length; i++) {
    const prev = new Date(commitDays[i - 1]);
    const curr = new Date(commitDays[i]);
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentForgiving++;
    } else if (diffDays === 2 && skipsUsed === 0) {
      currentForgiving += 2;
      skipsUsed = 1;
      const skipped = new Date(prev);
      skipped.setDate(skipped.getDate() + 1);
      currentSkippedDate = skipped.toISOString().split("T")[0];
    } else {
      if (currentForgiving > forgivingStreak) {
        forgivingStreak = currentForgiving;
        forgivingSkippedDate = currentSkippedDate;
      }
      currentForgiving = 1;
      currentSkippedDate = null;
      skipsUsed = 0;
    }
  }
  if (currentForgiving > forgivingStreak) {
    forgivingStreak = currentForgiving;
    forgivingSkippedDate = currentSkippedDate;
  }

  if (commitDays.length > 0) {
    const today = new Date().toISOString().split("T")[0];
    const lastCommitDay = commitDays[commitDays.length - 1];
    const daysSinceLastCommit =
      (new Date(today) - new Date(lastCommitDay)) / (1000 * 60 * 60 * 24);

    if (daysSinceLastCommit <= 1) {
      currentStreak = 1;
      for (let i = commitDays.length - 1; i > 0; i--) {
        const diff =
          (new Date(commitDays[i]) - new Date(commitDays[i - 1])) /
          (1000 * 60 * 60 * 24);
        if (diff === 1) currentStreak++;
        else break;
      }
    }
  }

  const weekdayCounts = {};
  sortedCommits.forEach((p) => {
    weekdayCounts[p.weekday] = (weekdayCounts[p.weekday] || 0) + 1;
  });
  const mostActiveWeekday = Object.entries(weekdayCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  const hourCounts = {};
  sortedCommits.forEach((p) => {
    hourCounts[p.hour] = (hourCounts[p.hour] || 0) + 1;
  });
  const mostActiveHour = Object.entries(hourCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];

  let weekendCommits = 0;
  let weekdayCommits = 0;
  sortedCommits.forEach((p) => {
    const isWeekend = p.weekday === "Saturday" || p.weekday === "Sunday";
    if (isWeekend) weekendCommits++;
    else weekdayCommits++;
  });

  const avgCommitsPerActiveDay =
    commitDays.length > 0
      ? (filteredCommits.length / commitDays.length).toFixed(1)
      : 0;

  const commitPersonality = detectCommitPersonality(allMessages);

  return {
    totalCommits: filteredCommits.length,
    longestStreak,
    currentStreak,
    mostActiveWeekday,
    mostActiveHour: mostActiveHour !== undefined ? `${mostActiveHour}:00` : null,
    weekendCommits,
    weekdayCommits,
    avgCommitsPerActiveDay,
    touchedRepos,
    totalAdditions,
    totalDeletions,
    longestGap,
    forgivingStreak,
    commitPersonality,
    timeline,
    forgivingSkippedDate,
    contributorsToYourRepos: Array.from(contributorsToYourRepos),
  };
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const period = params.period || "all";
  const cookieStore = await cookies();
  const userTimezone = cookieStore.get("tz")?.value || "Asia/Kolkata";
  const session = await auth();

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-bold">Code Wrapped 🎁</h1>
        <form
          action={async () => {
            "use server";
            await signIn("github");
          }}
        >
          <button
            type="submit"
            className="rounded-full bg-black px-6 py-3 text-white"
          >
            Sign in with GitHub
          </button>
        </form>
      </div>
    );
  }

  let sinceDate = null;
  let untilDate = null;
  const now = new Date();

  if (period === "7days") {
    sinceDate = new Date(now);
    sinceDate.setDate(sinceDate.getDate() - 7);
  } else if (period === "30days") {
    sinceDate = new Date(now);
    sinceDate.setDate(sinceDate.getDate() - 30);
  } else if (period === "3months") {
    sinceDate = new Date(now);
    sinceDate.setMonth(sinceDate.getMonth() - 3);
  } else if (period === "6months") {
    sinceDate = new Date(now);
    sinceDate.setMonth(sinceDate.getMonth() - 6);
  } else if (period === "thisyear") {
    sinceDate = new Date(now.getFullYear(), 0, 1);
  } else if (period === "lastyear") {
    sinceDate = new Date(now.getFullYear() - 1, 0, 1);
    untilDate = new Date(now.getFullYear(), 0, 1);
  } else if (period === "custom" && params.from) {
    sinceDate = new Date(params.from);
    if (params.to) {
      untilDate = new Date(params.to);
      untilDate.setDate(untilDate.getDate() + 1);
    }
  }

  const commitStats = await getCommitStats(
    session.accessToken,
    session.githubLogin,
    sinceDate,
    untilDate,
    userTimezone
  );

  const prStats = await getPullRequestStats(
    session.accessToken,
    session.githubLogin,
    sinceDate,
    untilDate
  );

  const issueStats = await getIssueStats(
    session.accessToken,
    session.githubLogin,
    sinceDate,
    untilDate
  );

  const totalContributions =
    commitStats.totalCommits + prStats.totalPRs + issueStats.totalIssues;

  const allRepos = await getRepos(session.accessToken);
  const relevantRepos =
    commitStats.touchedRepos.length > 0
      ? allRepos.filter((r) => commitStats.touchedRepos.includes(r.name))
      : [];

  const totalRepos = relevantRepos.length;
  const totalStars = relevantRepos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const mostStarred = relevantRepos.reduce(
    (max, r) => (r.stargazers_count > (max?.stargazers_count || 0) ? r : max),
    null
  );

  const languageCounts = {};
  relevantRepos.forEach((r) => {
    if (r.language) {
      languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
    }
  });
  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  // Rough placeholder percentile until we have real Code Wrapped user data to compare against
  const streakPercentile = Math.min(
    99,
    Math.round((commitStats.longestStreak / 30) * 100)
  );

  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const aiContent = await generateAIContent(
    {
      totalCommits: commitStats.totalCommits,
      longestStreak: commitStats.longestStreak,
      mostActiveWeekday: commitStats.mostActiveWeekday,
      mostActiveHour: commitStats.mostActiveHour,
      weekdayCommits: commitStats.weekdayCommits,
      weekendCommits: commitStats.weekendCommits,
      topLanguage: topLanguages[0]?.[0],
      totalAdditions: commitStats.totalAdditions,
    },
    session.githubLogin,
    period,
    commitStats.commitPersonality
  );

  return (
    <div>
      <TimezoneDetector />
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center gap-2 bg-white/80 backdrop-blur-sm py-3">
        <p className="text-sm font-medium">Signed in as {session.user.name}</p>
        <DateRangePicker />
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button className="rounded-full bg-zinc-800 px-4 py-1.5 text-xs text-white">
            Sign out
          </button>
        </form>
      </div>

      <WrappedSlides
        name={session.user.name}
        avatarUrl={session.user.image}
        totalCommits={commitStats.totalCommits}
        longestStreak={commitStats.longestStreak}
        currentStreak={commitStats.currentStreak}
        mostActiveWeekday={commitStats.mostActiveWeekday}
        mostActiveHour={commitStats.mostActiveHour}
        weekdayCommits={commitStats.weekdayCommits}
        weekendCommits={commitStats.weekendCommits}
        topLanguages={topLanguages}
        mostStarred={mostStarred}
        totalRepos={totalRepos}
        totalStars={totalStars}
        streakPercentile={streakPercentile}
        generatedDate={generatedDate}
        totalAdditions={commitStats.totalAdditions}
        totalDeletions={commitStats.totalDeletions}
        aiStory={aiContent.story}
        aiRoast={aiContent.roast}
        aiHype={aiContent.hype}
        aiQuote={aiContent.quote}
        archetype={aiContent.archetype}
        longestGap={commitStats.longestGap}
        forgivingStreak={commitStats.forgivingStreak}
        forgivingSkippedDate={commitStats.forgivingSkippedDate}
        commitPersonality={commitStats.commitPersonality}
        timeline={commitStats.timeline}
        totalPRs={prStats.totalPRs}
        mergedPRs={prStats.mergedPRs}
        ownRepoPRs={prStats.ownRepoPRs}
        otherRepoPRs={prStats.otherRepoPRs}
        prTimeline={prStats.timeline}
        contributorsToYourRepos={commitStats.contributorsToYourRepos}
        totalIssues={issueStats.totalIssues}
        totalContributions={totalContributions}
      />

      </div>
  );
}