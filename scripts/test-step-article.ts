async function test() {
  console.log('Testing step-by-step article generator...\n');
  const res = await fetch('http://localhost:3000/api/article-writer/step', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      step: 'research',
      seed: 'best audio to video ai',
    }),
  });

  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body:', text.slice(0, 300));
}
test();
