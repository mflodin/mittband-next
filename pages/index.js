import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Heloo</h1>
      <Link href="/songs">
        <a>Songs</a>
      </Link>
    </main>
  );
}
