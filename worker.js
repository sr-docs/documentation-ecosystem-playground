const ALLOWED_WORKFLOWS = ['create-plan-issue.yml'];
const ALLOWED_ORIGIN = 'https://sr-docs.github.io';
const GITHUB_OWNER = 'sr-docs';
const GITHUB_REPO = 'documentation-ecosystem-playground';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

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
  },
};
