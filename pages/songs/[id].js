import { useState } from "react";
import Head from "next/head";
import "isomorphic-fetch";

function chordsToText(chords) {
  let text = "";
  let i = 0;
  chords.forEach((chord) => {
    for (; i < chord.offset; i++) {
      text += " ";
    }
    text += chord.chord;
  });
  return text;
}

function Song({ song, showSectionNames, showChords }) {
  return (
    <article className="song b">
      {song.sections.map((section, i) => {
        return (
          <section
            key={i}
            className={"song-section " + section.type.replace(/\s/g, "-")}
          >
            {showSectionNames ? `[${section.type}]` : null}
            {section.lines.map((line, j) => {
              return (
                <React.Fragment key={j}>
                  {showChords ? (
                    <div className="chords line">
                      {chordsToText(line.chords)}
                    </div>
                  ) : null}
                  {showChords || line.text !== " " ? (
                    <div className="lyrics line">{line.text}</div>
                  ) : null}
                </React.Fragment>
              );
            })}
          </section>
        );
      })}

      <style jsx>{`
        label + label {
          margin-left: 10px;
        }

        .song {
          font-size: 16px;
          font-family: monospace;
          white-space: pre;
        }

        .song-section {
          margin-bottom: 32px;
        }

        .line {
        }

        .chords {
          margin-top: 5px;
          color: #666;
        }
      `}</style>
    </article>
  );
}

function parseText(text) {
  let song = { sections: [] };
  let currentSection;
  let rowType;
  let line;

  text.split("\n").forEach((row) => {
    if (rowType === "chords") {
      if (row.trim().length === 0) {
        rowType = undefined;
        return;
      }

      let chordSplit = row.split(" ");
      let offset = 0;
      let chords = [];
      chordSplit.forEach((chord) => {
        if (chord.length === 0) {
          offset += 1;
          return;
        }

        chords.push({ chord, offset });
        // offset += chord.length;
        offset += 1;
      });
      line = { chords };
      currentSection.lines.push(line);
      rowType = "text";
      return;
    }

    if (rowType === "text") {
      line.text = row || " ";
      rowType = "chords";
      return;
    }

    const sectionRegex = /\s*\[(.+)\]\s*/;
    const match = row.match(sectionRegex);
    if (match) {
      currentSection = {
        type: match[1].trim().toLowerCase(),
        lines: [],
      };
      song.sections.push(currentSection);
      rowType = "chords";
    }
    return <div className="row">{row}</div>;
  });

  return song;
}

export default function SongPage({ text, title, artist }) {
  const [showSectionNames, setShowSectionNames] = useState(false);
  const [showChords, setShowChords] = useState(true);

  return (
    <div className="container">
      <Head>
        <title>
          {title} - {artist}
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <aside>
        <label>
          Section names
          <input
            type="checkbox"
            name="sectionNames"
            checked={showSectionNames}
            onChange={() => setShowSectionNames(!showSectionNames)}
          />
        </label>
        <label>
          Chords
          <input
            type="checkbox"
            name="chords"
            checked={showChords}
            onChange={() => setShowChords(!showChords)}
          />
        </label>
      </aside>

      <main>
        <h1 className="title">
          {title} - {artist}
        </h1>
        <Song
          song={parseText(text)}
          showChords={showChords}
          showSectionNames={showSectionNames}
        />
      </main>

      <style jsx>{`
        label + label {
          margin-left: 10px;
        }

        .title {
          font-family: Helvetica, Arial, sans-serif;
        }

        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        *,
        :before,
        :after {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  // Fetch data from external API
  const text = await (
    await fetch(`${process.env.ORIGIN}/data/${params.id}.txt`)
  ).text();

  const songs = await (
    await fetch(`${process.env.ORIGIN}/data/songs.json`)
  ).json();

  const { title, artist } = songs.find((s) => s.id === params.id) ?? {};

  // Pass data to the page via props
  return { props: { text, title, artist } };
}
