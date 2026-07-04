const ALLOWED_WORKFLOWS = ['create-plan-issue.yml', 'create-write-pr.yml', 'request-write-review.yml'];
const ALLOWED_ORIGIN = 'https://sr-docs.github.io';
const GITHUB_OWNER = 'sr-docs';
const GITHUB_REPO = 'documentation-ecosystem-playground';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function checkRateLimit(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `rate:${ip}`;
  const limit = 10;
  const windowSeconds = 60;

  const current = await env.RATE_LIMIT.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= limit) {
    return false;
  }

  await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: windowSeconds });
  return true;
}

async function handleDispatch(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { workflowFile, ref, inputs } = body;

  if (!ALLOWED_WORKFLOWS.includes(workflowFile)) {
    return jsonResponse({ error: 'Workflow not allowed' }, 400);
  }

  const githubUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${workflowFile}/dispatches`;

  const githubResponse = await fetch(githubUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'doc-playground-proxy',
    },
    body: JSON.stringify({ ref: ref || 'main', inputs }),
  });

  if (githubResponse.status === 204) {
    return jsonResponse({ ok: true }, 200);
  }

  const errorText = await githubResponse.text();
  return jsonResponse({ error: `GitHub dispatch failed: ${errorText}` }, githubResponse.status);
}

async function handlePoll(request, env) {
  const url = new URL(request.url);
  const labels = url.searchParams.get('labels') || '';
  const type = url.searchParams.get('type') || 'issues';

  const endpoint =
    type === 'pulls'
      ? `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls?state=all&sort=created&direction=desc&per_page=10`
      : `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?labels=${labels}&state=all&sort=created&direction=desc&per_page=10`;

  const githubResponse = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${env.WRITE_PAT}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'doc-playground-proxy',
    },
  });

  const data = await githubResponse.json();
  return jsonResponse(data, githubResponse.status);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const allowed = await checkRateLimit(request, env);
    if (!allowed) {
      return jsonResponse({ error: 'Too many requests. Try again in a minute.' }, 429);
    }

    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/poll') {
      return handlePoll(request, env);
    }

    if (request.method === 'POST') {
      return handleDispatch(request, env);
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  },
};
