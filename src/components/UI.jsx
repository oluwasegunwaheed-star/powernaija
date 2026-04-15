import { motion } from 'framer-motion'

export function SkeletonCard() {
  return (
    <div style={styles.card}>
      <div style={styles.skeletonTitle}></div>
      <div style={styles.skeletonLine}></div>
      <div style={styles.skeletonLine}></div>
    </div>
  )
}

export function EmptyState({ text }) {
  return (
    <div style={styles.empty}>
      <h3>📭 No Data</h3>
      <p>{text}</p>
    </div>
  )
}

export function DashboardCard({ title, value }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} style={styles.card}>
      <h4>{title}</h4>
      <p style={styles.value}>{value}</p>
    </motion.div>
  )
}

const styles = {
  card: {
    background: '#fff',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '10px',
  },
  value: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#777',
  },
  skeletonTitle: {
    height: '20px',
    width: '60%',
    background: '#eee',
    marginBottom: '10px',
  },
  skeletonLine: {
    height: '12px',
    width: '100%',
    background: '#eee',
    marginBottom: '8px',
  },
}