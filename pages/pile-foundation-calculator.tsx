import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PilePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/pile-calculator');
  }, [router]);
  
  return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 'Redirecting to Pile Foundation Calculator...');
}
