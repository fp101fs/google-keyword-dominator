/**
 * GitHub Integration & Auto-Convention Scanner
 * Ported from content-engine-site
 */

const GITHUB_API = 'https://api.github.com';

export interface GithubRepo {
  full_name: string;
  default_branch: string;
  permissions?: { push?: boolean };
}

export interface RepoConventionCheck {
  folderExists: boolean;
  blogPackagesFound: string[];
  suggestedFolder: string | null;
  platform: string | null;
  articleCount: number;
}

async function githubFetch(token: string, path: string, init?: RequestInit) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[gkd] GitHub API ${res.status} on ${path}:`, body);
    throw new Error(`GitHub API error (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

async function githubFetchOptional(token: string, path: string) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    return null;
  }
  return res.json();
}

const BLOG_PACKAGES = ['gray-matter', 'contentlayer', '@contentlayer/core', 'velite', '@nuxt/content', 'next-mdx-remote'];

const PLATFORM_PACKAGES: Record<string, string> = {
  next: 'Next.js',
  astro: 'Astro',
  nuxt: 'Nuxt',
  gatsby: 'Gatsby',
  '@sveltejs/kit': 'SvelteKit',
  '@remix-run/react': 'Remix',
  vite: 'Vite',
};

function detectPlatform(deps: Record<string, string>): string | null {
  for (const [pkg, label] of Object.entries(PLATFORM_PACKAGES)) {
    if (pkg in deps) return label;
  }
  return null;
}

async function countContentFolders(token: string, owner: string, name: string, defaultBranch: string): Promise<Map<string, number> | null> {
  try {
    const tree = (await githubFetchOptional(token, `/repos/${owner}/${name}/git/trees/${defaultBranch}?recursive=1`)) as {
      tree?: Array<{ path: string; type: string }>;
    } | null;
    if (!tree?.tree) return null;

    const counts = new Map<string, number>();
    for (const entry of tree.tree) {
      if (entry.type !== 'blob' || !/\.mdx?$/.test(entry.path)) continue;
      const dir = entry.path.includes('/') ? entry.path.slice(0, entry.path.lastIndexOf('/')) : '';
      if (!dir) continue;
      counts.set(dir, (counts.get(dir) || 0) + 1);
    }
    return counts;
  } catch {
    return null;
  }
}

export async function checkRepoConventions(
  token: string,
  repo: string,
  folder: string = 'content/posts',
  defaultBranch = 'main'
): Promise<RepoConventionCheck> {
  const [owner, name] = repo.split('/') as [string, string];

  const folderInfo = await githubFetchOptional(token, `/repos/${owner}/${name}/contents/${folder}`);
  const folderExists = Array.isArray(folderInfo) || (folderInfo !== null && !Array.isArray(folderInfo));

  const pkgFile = (await githubFetchOptional(token, `/repos/${owner}/${name}/contents/package.json`)) as { content?: string } | null;
  let blogPackagesFound: string[] = [];
  let platform: string | null = null;

  if (pkgFile?.content) {
    try {
      const pkg = JSON.parse(Buffer.from(pkgFile.content, 'base64').toString('utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      blogPackagesFound = BLOG_PACKAGES.filter((pkgName) => pkgName in deps);
      platform = detectPlatform(deps);
    } catch {
      // unparseable package.json
    }
  }

  let suggestedFolder: string | null = null;
  let articleCount = 0;
  const counts = await countContentFolders(token, owner, name, defaultBranch);
  if (counts) {
    const targetCount = counts.get(folder) || 0;
    articleCount = targetCount;
    let best: string | null = null;
    let bestCount = targetCount;
    for (const [dir, count] of counts) {
      if (dir !== folder && count > bestCount) {
        best = dir;
        bestCount = count;
      }
    }
    if (best) suggestedFolder = best;
  }

  return { folderExists, blogPackagesFound, suggestedFolder, platform, articleCount };
}

export async function listUserRepos(token: string): Promise<GithubRepo[]> {
  const all: GithubRepo[] = [];
  for (let page = 1; page <= 5; page++) {
    const batch = (await githubFetch(token, `/user/repos?per_page=100&sort=updated&page=${page}`)) as GithubRepo[];
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all.filter((r) => r.permissions?.push === true);
}

export async function publishFileToGithub(
  token: string,
  opts: {
    repo: string;
    path: string;
    content: string;
    message: string;
  }
): Promise<{ fileUrl: string; commitUrl: string }> {
  const [owner, name] = opts.repo.split('/');
  const encoded = Buffer.from(opts.content, 'utf-8').toString('base64');

  let sha: string | undefined;
  try {
    const existing = (await githubFetch(token, `/repos/${owner}/${name}/contents/${opts.path}`)) as { sha: string };
    sha = existing.sha;
  } catch {
    // New file
  }

  const result = (await githubFetch(token, `/repos/${owner}/${name}/contents/${opts.path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: opts.message,
      content: encoded,
      sha,
    }),
  })) as { content: { html_url: string }; commit: { html_url: string } };

  return {
    fileUrl: result.content.html_url,
    commitUrl: result.commit.html_url,
  };
}
