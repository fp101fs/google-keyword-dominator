import { generateSearchOpportunityGraph } from '../src/lib/intelligence/opportunity-graph';
import { GscQueryItem } from '../src/lib/gsc/types';

async function runTest() {
  console.log('Testing Opportunity Graph for wavreel.com...\n');

  // Simulated ranking queries for wavreel.com
  const mockQueries: GscQueryItem[] = [
    { query: 'audio to video ai', clicks: 120, impressions: 4500, ctr: 0.026, position: 11.2 },
    { query: 'ai video narrator', clicks: 95, impressions: 3800, ctr: 0.025, position: 12.4 },
    { query: 'best audio to video ai generator', clicks: 80, impressions: 2900, ctr: 0.027, position: 13.1 },
    { query: 'wav to mp4 ai', clicks: 65, impressions: 2100, ctr: 0.030, position: 14.0 },
    { query: 'wave maker', clicks: 40, impressions: 1800, ctr: 0.022, position: 15.2 }, // Ambiguous query that used to trigger reef tank
  ];

  const graph = await generateSearchOpportunityGraph('https://wavreel.com', mockQueries);

  console.log(`Total Wins Discovered: ${graph.totalWinsDiscovered}`);
  console.log(`Total Actions: ${graph.actions.length}\n`);

  console.log('--- Top Generated Actions ---');
  graph.actions.forEach((act) => {
    console.log(`#${act.rank} [${act.actionLabel}] (Score: ${act.estimatedImpactScore})`);
    console.log(`  Title: ${act.title}`);
    console.log(`  Target Query: "${act.targetQuery}"`);
    console.log(`  Traffic Impact: ${act.estimatedTrafficImpact}`);
    console.log('');
  });

  // Verification checks
  const hasReefTank = graph.actions.some((a) =>
    a.title.toLowerCase().includes('reef') ||
    a.title.toLowerCase().includes('tank') ||
    a.targetQuery.toLowerCase().includes('reef') ||
    a.targetQuery.toLowerCase().includes('tank')
  );

  console.log('--- Test Assertions ---');
  console.log(`Check 1: Zero aquarium / reef tank noise: ${!hasReefTank ? 'PASSED (Clean)' : 'FAILED'}`);

  // Check for duplicates
  const titles = graph.actions.map((a) => a.title);
  const uniqueTitles = new Set(titles);
  console.log(`Check 2: Zero duplicate action titles: ${titles.length === uniqueTitles.size ? 'PASSED (Clean)' : 'FAILED'}`);
}

runTest().catch((err) => {
  console.error('Test execution failed:', err);
});
