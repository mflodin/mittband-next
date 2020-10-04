import "isomorphic-fetch";
import Link from "next/link";

export default function Songs({ songs = [] }) {
  return (
    <main>
      <h1>Songs</h1>
      <ol>
        {songs.map((song) => {
          return (
            <li key={song.id}>
              <Link href={`/songs/${song.id}`}>
                <a>
                  {song.title} - {song.artist}
                </a>
              </Link>
            </li>
          );
        })}
      </ol>
    </main>
  );
}

export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(`${process.env.ORIGIN}/data/songs.json`);
  const songs = await res.json();

  // Pass data to the page via props
  return { props: { songs } };
}
