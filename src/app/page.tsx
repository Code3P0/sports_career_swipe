"use client";


import Link from 'next/link'
import styles from './page.module.css'
export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '2rem',
        marginBottom: '2rem',
        fontWeight: 'bold'
      }}>
        Sports Career Swipe
      </h1>
      <p style={{
        fontSize: '1.1rem',
        marginBottom: '3rem',
        color: '#666',
        maxWidth: '400px'
      }}>
        Find your sports business lane in under 3 minutes
      </p>
  <Link href="/play" className={styles.startButton}>
  Start
</Link>
</main>
  )
}