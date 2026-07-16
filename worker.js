const ALLOWED_WORKFLOWS = [
  'create-plan-issue.yml',
  'create-write-pr.yml',
  'request-write-review.yml',
  'comment-on-plan-issue.yml',
  'submit-pr-review.yml',
  'publish-quickstart.yml',
  'create-observe-issue.yml',
  'update-write-pr.yml',
];

const ALLOWED_ORIGIN = 'https://sr-docs.github.io';
const GITHUB_OWNER = 'sr-docs';
const GITHUB_REPO = 'documentation-ecosystem-playground';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const INPUT_RULES = {
  'create-plan-issue.yml': {
    title: 200,
    problem: 2000,
    audience: 500,
    documentationNeeded: 1000,
    successCriteria: 1000,
    requestId: 'uuid',
  },
  'create-write-pr.yml': {
    title: 200,
    draftContent: 2000,
    requestId: 'uuid',
  },
  'request-write-review.yml': {
    prNumber: 'number',
  },
  'comment-on-plan-issue.yml': {
    issueNumber: 'number',
    prUrl: 500,
  },
  'submit-pr-review.yml': {
    prNumber: 'number',
    comment: 2000,
    decision: ['Approved', 'Changes requested'],
  },
  'publish-quickstart.yml': {
    draftContent: 2000,
    reviewStatus: ['approved', 'changes-requested', 'not-reviewed', 'unknown'],
    runLinkCheck: 'boolean',
    runHeadingCheck: 'boolean',
    runCodeBlockCheck: 'boolean',
    runValeCheck: 'boolean',
    requestId: 'uuid',
  },
  'create-observe-issue.yml': {
    title: 200,
    observation: 2000,
    recommendation: 2000,
    requestId: 'uuid',
  },
  'update-write-pr.yml': {
    draftContent: 2000,
    requestId: 'uuid',
  },
};

function validateInputs(workflowFile, inputs) {
  const rules = INPUT_RULES[workflowFile];
  if (!rules) {
    return 'No validation rules defined for this workflow.';
  }

  if (typeof inputs !== 'object' || inputs === null) {
    return 'Inputs must be an object.';
  }

  const allowedKeys = Object.keys(rules);
  const givenKeys = Object.keys(inputs);

  for (const key of givenKeys) {
    if (!allowedKeys.includes(key)) {
      return `Unexpected input field: ${key}`;
    }
  }

  for (const key of allowedKeys) {
    const rule = rules[key];
    const value = inputs[key];

    if (value === undefined || value === null) {
      return `Missing required input: ${key}`;
    }

    if (rule === 'uuid') {
      if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
        return `Invalid requestId format for: ${key}`;
      }
    } else if (rule === 'number') {
      if (typeof value !== 'string' || !/^\d+$/.test(value)) {
        return `Field must be a numeric string: ${key}`;
      }
    } else if (rule === 'boolean') {
      if (value !== 'true' && value !== 'false') {
        return `Field must be "true" or "false": ${key}`;
      }
    } else if (Array.isArray(rule)) {
      if (!rule.includes(value)) {
        return `Invalid value for ${key}. Allowed: ${rule.join(', ')}`;
      }
    } else if (typeof rule === 'number') {
      if (typeof value !== 'string' || value.length === 0 || value.length > rule) {
        return `Field ${key} must be a string between 1 and ${rule} characters.`;
      }
    }
  }

  return null;
}

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
  if (!env.RATE_LIMIT) {
    return true;
  }

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

  const validationError = validateInputs(workflowFile, inputs);
  if (validationError) {
    return jsonResponse({ error: `Invalid input: ${validationError}` }, 400);
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

async function handleFile(request, env) {
  const url = new URL(request.url);
  const path = url.searchParams.get('path');
  const ref = url.searchParams.get('ref') || 'main';

  if (!path) {
    return jsonResponse({ error: 'Missing path parameter' }, 400);
  }

  const endpoint = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${encodeURIComponent(ref)}`;

  const githubResponse = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${env.WRITE_PAT}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'doc-playground-proxy',
    },
  });

  if (!githubResponse.ok) {
    const errorText = await githubResponse.text();
    return jsonResponse({ error: `File fetch failed: ${errorText}` }, githubResponse.status);
  }

  const data = await githubResponse.json();
  const decoded = atob(data.content.replace(/\n/g, ''));

  return jsonResponse({ content: decoded }, 200);
}

async function handleChecks(request, env) {
  const url = new URL(request.url);
  const sha = url.searchParams.get('sha');

  if (!sha) {
    return jsonResponse({ error: 'Missing sha parameter' }, 400);
  }

  const endpoint = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits/${sha}/check-runs`;

  const githubResponse = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${env.WRITE_PAT}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'doc-playground-proxy',
    },
  });

  if (!githubResponse.ok) {
    const errorText = await githubResponse.text();
    return jsonResponse({ error: `Checks fetch failed: ${errorText}` }, githubResponse.status);
  }

  const data = await githubResponse.json();
  return jsonResponse(data, 200);
}

async function handlePRComments(request, env) {
  const url = new URL(request.url);
  const prNumber = url.searchParams.get('prNumber');

  if (!prNumber) {
    return jsonResponse({ error: 'Missing prNumber parameter' }, 400);
  }

  const endpoint = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${prNumber}/comments?sort=created&direction=desc&per_page=10`;

  const githubResponse = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${env.WRITE_PAT}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'doc-playground-proxy',
    },
  });

  if (!githubResponse.ok) {
    const errorText = await githubResponse.text();
    return jsonResponse({ error: `Comments fetch failed: ${errorText}` }, githubResponse.status);
  }

  const data = await githubResponse.json();
  return jsonResponse(data, 200);
}

async function handlePublishHistory(request, env) {
  const endpoint = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?path=publish-results&sha=publish-results&per_page=20`;

  const githubResponse = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${env.WRITE_PAT}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'doc-playground-proxy',
    },
  });

  if (!githubResponse.ok) {
    const errorText = await githubResponse.text();
    return jsonResponse({ error: `History fetch failed: ${errorText}` }, githubResponse.status);
  }

  const data = await githubResponse.json();
  return jsonResponse(data, 200);
}

async function logDispatch(env, workflowFile) {
  if (!env.RATE_LIMIT) {
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  const key = `log:${today}:${workflowFile}`;
  const current = await env.RATE_LIMIT.get(key);
  const count = current ? parseInt(current, 10) : 0;
  await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: 60 * 60 * 24 * 8 });
}

export default {
  async fetch(request, env) {
    try {
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

      if (request.method === 'GET' && url.pathname === '/file') {
        return handleFile(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/checks') {
        return handleChecks(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/pr-comments') {
        return handlePRComments(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/publish-history') {
        return handlePublishHistory(request, env);
      }

      if (request.method === 'POST') {
        const requestForLogging = request.clone();
        const response = await handleDispatch(request, env);

        if (response.status === 200) {
          const loggedBody = await requestForLogging.json().catch(() => ({}));
          await logDispatch(env, loggedBody.workflowFile);
        }

        return response;
      }

      return jsonResponse({ error: 'Method not allowed' }, 405);
    } catch (err) {
      return jsonResponse({ error: `Worker error: ${err.message}` }, 500);
    }
  },
};
