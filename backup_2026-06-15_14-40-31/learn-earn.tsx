import React from "react";
import { useRouter } from "next/router";

const styles = {
  container: { maxWidth: '100%', margin: 0, padding: '20px', backgroundColor: '#f5f0e8', minHeight: '100vh' },
  header: { backgroundColor: '#1a7f6e', padding: '16px', borderRadius: '8px', marginBottom: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px' },
  backButton: { backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' },
  headerTitle: { margin: 0, fontSize: '20px', flex: 1 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
};

export default function LearnEarn() {
  const router = useRouter();
  const courses = [
    { name: 'Estimation Course', icon: '📐', duration: '4 weeks' },
    { name: 'Billing Course', icon: '💰', duration: '3 weeks' },
    { name: 'Contracting', icon: '📝', duration: '6 weeks' },
    { name: 'Project Management', icon: '📊', duration: '8 weeks' }
  ];

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: () => router.push('/'), style: styles.backButton }, '←'),
      React.createElement('h1', { style: styles.headerTitle }, '📚 Learn & Earn'),
      React.createElement('div', null)
    ),
    React.createElement('div', { style: styles.grid },
      courses.map(course => React.createElement('div', { key: course.name, style: styles.card },
        React.createElement('div', { style: { fontSize: '48px' } }, course.icon),
        React.createElement('h3', null, course.name),
        React.createElement('p', null, course.duration)
      ))
    )
  );
}
