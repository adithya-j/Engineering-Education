"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";

type Round = {
  teams: string[][];
  repeats: number;
};

const sampleNames = Array.from({ length: 36 }, (_, index) =>
  `Student ${String(index + 1).padStart(2, "0")}`
).join("\n");

function cleanNames(raw: string) {
  const names = raw
    .split(/\r?\n/)
    .map((line) => line.split(",")[0].trim())
    .filter(Boolean);
  return [...new Set(names)];
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function pairKey(a: string, b: string) {
  return [a, b].sort((x, y) => x.localeCompare(y)).join("|||");
}

function teamSizes(total: number, preferred: number) {
  const count = Math.max(1, Math.round(total / preferred));
  const base = Math.floor(total / count);
  const remainder = total % count;
  return Array.from({ length: count }, (_, index) =>
    index < remainder ? base + 1 : base
  );
}

function splitTeams(names: string[], sizes: number[]) {
  const teams: string[][] = [];
  let cursor = 0;
  for (const size of sizes) {
    teams.push(names.slice(cursor, cursor + size));
    cursor += size;
  }
  return teams;
}

function repeatedPairScore(teams: string[][], history: Map<string, number>) {
  let score = 0;
  for (const team of teams) {
    for (let a = 0; a < team.length; a += 1) {
      for (let b = a + 1; b < team.length; b += 1) {
        score += history.get(pairKey(team[a], team[b])) ?? 0;
      }
    }
  }
  return score;
}

function addPairs(teams: string[][], history: Map<string, number>) {
  for (const team of teams) {
    for (let a = 0; a < team.length; a += 1) {
      for (let b = a + 1; b < team.length; b += 1) {
        const key = pairKey(team[a], team[b]);
        history.set(key, (history.get(key) ?? 0) + 1);
      }
    }
  }
}

function makeRounds(names: string[], preferred: number, count: number) {
  const history = new Map<string, number>();
  const sizes = teamSizes(names.length, preferred);
  const rounds: Round[] = [];

  for (let roundIndex = 0; roundIndex < count; roundIndex += 1) {
    let bestTeams: string[][] = [];
    let bestScore = Number.POSITIVE_INFINITY;

    for (let trial = 0; trial < 350; trial += 1) {
      const candidate = splitTeams(shuffle(names), sizes);
      const score = repeatedPairScore(candidate, history);
      if (score < bestScore) {
        bestScore = score;
        bestTeams = candidate;
        if (score === 0) break;
      }
    }

    addPairs(bestTeams, history);
    rounds.push({ teams: bestTeams, repeats: bestScore });
  }

  return { rounds, history };
}

function downloadCsv(filename: string, rows: string[][]) {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const csv = rows.map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function TeamGenerator() {
  const [rawNames, setRawNames] = useState("");
  const [preferredSize, setPreferredSize] = useState(4);
  const [roundCount, setRoundCount] = useState(5);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [history, setHistory] = useState<Map<string, number>>(new Map());

  const names = useMemo(() => cleanNames(rawNames), [rawNames]);
  const repeats = useMemo(
    () =>
      [...history.entries()]
        .filter(([, count]) => count > 1)
        .map(([key, count]) => ({ names: key.split("|||"), count }))
        .sort((a, b) => b.count - a.count),
    [history]
  );

  function generate() {
    if (names.length < 2) return;
    const result = makeRounds(names, preferredSize, roundCount);
    setRounds(result.rounds);
    setHistory(result.history);
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRawNames(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  function exportRounds() {
    const rows = [["Round", "Team", "Student"]];
    rounds.forEach((round, roundIndex) =>
      round.teams.forEach((team, teamIndex) =>
        team.forEach((student) =>
          rows.push([
            String(roundIndex + 1),
            String(teamIndex + 1),
            student,
          ])
        )
      )
    );
    downloadCsv("team-assignments.csv", rows);
  }

  return (
    <main className="tool-shell">
      <Link className="back-link" href="/">← Back to all tools</Link>

      <section className="tool-intro">
        <p className="eyebrow">Team formation tool</p>
        <h1>Social Golfer Team Generator</h1>
        <p>
          Generate multiple rounds of teams while reducing repeat teammate
          pairings. Changing rosters are fine—paste or upload the current list
          whenever you generate a new schedule.
        </p>
        <p className="privacy-note">
          Privacy: roster names are processed only in this browser and are not
          uploaded or saved.
        </p>
      </section>

      <div className="generator-layout">
        <section className="panel">
          <h2>Roster and settings</h2>
          <div className="field">
            <label htmlFor="names">One student per line</label>
            <textarea
              id="names"
              value={rawNames}
              onChange={(event) => setRawNames(event.target.value)}
              placeholder={"Alex Morgan\nJordan Lee\nSam Rivera"}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="team-size">Preferred team size</label>
              <input
                id="team-size"
                type="number"
                min="2"
                max="12"
                value={preferredSize}
                onChange={(event) =>
                  setPreferredSize(
                    Math.min(12, Math.max(2, Number(event.target.value)))
                  )
                }
              />
            </div>
            <div className="field">
              <label htmlFor="rounds">Number of rounds</label>
              <input
                id="rounds"
                type="number"
                min="1"
                max="20"
                value={roundCount}
                onChange={(event) =>
                  setRoundCount(
                    Math.min(20, Math.max(1, Number(event.target.value)))
                  )
                }
              />
            </div>
          </div>

          <div className="button-row">
            <button
              className="button primary"
              type="button"
              disabled={names.length < 2}
              onClick={generate}
            >
              Generate teams
            </button>
            <label className="button secondary file-label">
              Upload CSV
              <input
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                onChange={handleFile}
              />
            </label>
            <button
              className="button secondary"
              type="button"
              onClick={() => setRawNames(sampleNames)}
            >
              Load sample
            </button>
          </div>
          <p className="status">
            {names.length} unique {names.length === 1 ? "student" : "students"}{" "}
            detected
          </p>
        </section>

        <section className="panel" aria-live="polite">
          <div className="round-header">
            <h2>Team assignments</h2>
            <button
              className="button secondary"
              type="button"
              disabled={rounds.length === 0}
              onClick={exportRounds}
            >
              Export CSV
            </button>
          </div>

          {rounds.length === 0 ? (
            <div className="empty-state">
              <p>Add a roster and generate teams to see the assignments.</p>
            </div>
          ) : (
            <>
              {rounds.map((round, roundIndex) => (
                <div className="round" key={roundIndex}>
                  <div className="round-header">
                    <h3>Round {roundIndex + 1}</h3>
                    <span className="round-score">
                      Repeat-pair score: {round.repeats}
                    </span>
                  </div>
                  <div className="teams">
                    {round.teams.map((team, teamIndex) => (
                      <article className="team" key={teamIndex}>
                        <h4>Team {teamIndex + 1}</h4>
                        <ol>
                          {team.map((student) => (
                            <li key={student}>{student}</li>
                          ))}
                        </ol>
                      </article>
                    ))}
                  </div>
                </div>
              ))}

              <div className="overlap-report">
                <h3>Repeated teammate pairs</h3>
                {repeats.length === 0 ? (
                  <p>No repeated pairs in this schedule.</p>
                ) : (
                  <ul>
                    {repeats.map((repeat) => (
                      <li key={repeat.names.join("-")}>
                        {repeat.names.join(" and ")} — {repeat.count} rounds
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
