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

function renderSong({ song, showSectionNames, showChords }) {
  // console.log({ song });
  return song.sections.map((section) => {
    return (
      <section className={"song-section " + section.type.replace(/\s/g, "-")}>
        {showSectionNames ? `[${section.type}]` : null}
        {section.lines.map((line) => {
          return (
            <>
              {showChords ? (
                <div className="line">{chordsToText(line.chords)}</div>
              ) : null}
              <div className="line">{line.text}</div>
            </>
          );
        })}
        <div className="line"> </div>
      </section>
    );
  });
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

export default function Song({ text, title, artist }) {
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
        <h1>
          {title} - {artist}
        </h1>
        {/* <article className="song">
          <section className="verse">
            <div className="row">
              <span className="chord">Bm</span>Hello?
            </div>
            <div className="row">
              Is there anybody <span className="chord">A</span>in there ?
            </div>
            <div className="row">
              Just nod if you can <span className="chord">G</span>hear me{" "}
              <span className="chord">G/F#</span>
              {"       "}
              <span className="chord">Em</span>
            </div>
            <div className="row">
              Is there <span className="chord">Bm</span>anyone at home?
            </div>
          </section>
        </article> */}
        {/* <article className="song a">{text}</article> */}
        <article className="song b">
          {renderSong({ song: parseText(text), showChords, showSectionNames })}
        </article>
      </main>

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
          margin-bottom: 16px;
        }

        .row {
          position: relative;
          line-height: 2.5;
        }

        .chord {
          position: absolute;
          bottom: 1em;
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

  console.log(songs, params.id);
  const { title, artist } = songs.find((s) => s.id === params.id) ?? {};

  // Pass data to the page via props
  return { props: { text, title, artist } };
}
