import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Sports Career Swipe</h1>
          <p>
            A fast tournament that converges on the sports-business lane you’d
            actually enjoy.
          </p>
        </div>

        <div className={styles.ctas}>
          <Link className={styles.primary} href="/play">
            Start
          </Link>
        </div>
      </main>
    </div>
  );
}
