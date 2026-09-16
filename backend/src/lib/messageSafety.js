const MODERATION_URL = 'https://deep9933-toxic-dector.hf.space/predict';

function normalizeModerationResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    // If response format is invalid, fallback to allowing the message
    return { allowed: true };
  }

  if (typeof payload.is_toxic === 'boolean') {
    return payload.is_toxic
      ? { allowed: false, reason: 'Message flagged as unsafe' }
      : { allowed: true };
  }

  if (typeof payload.toxicity_score === 'number') {
    return payload.toxicity_score >= 0.5
      ? { allowed: false, reason: 'Message flagged as unsafe' }
      : { allowed: true };
  }

  const verdict = payload.verdict ?? payload.label ?? payload.result ?? payload.classification;
  const safeFlag = payload.safe ?? payload.isSafe ?? payload.allowed;
  const unsafeFlag = payload.unsafe ?? payload.isUnsafe ?? payload.blocked;

  if (safeFlag === false || unsafeFlag === true) {
    return { allowed: false, reason: payload.message || 'Message flagged as unsafe' };
  }

  if (safeFlag === true) {
    return { allowed: true };
  }

  if (typeof verdict === 'string') {
    const normalized = verdict.toLowerCase();
    const unsafeLabels = ['toxic', 'unsafe', 'unsafe_content', 'hate', 'harassment', 'abuse', 'offensive', 'spam'];
    if (unsafeLabels.includes(normalized)) {
      return { allowed: false, reason: payload.message || 'Message flagged as unsafe' };
    }

    const safeLabels = ['safe', 'non-toxic', 'non_toxic', 'benign', 'not_toxic', 'not-toxic', 'clean'];
    if (safeLabels.includes(normalized)) {
      return { allowed: true };
    }
  }

  if (typeof payload.score === 'number') {
    return payload.score >= 0.5
      ? { allowed: false, reason: 'Message flagged as unsafe' }
      : { allowed: true };
  }

  // Fallback: If AI returns an unhandled response, allow message to proceed
  return { allowed: true };
}

export async function checkMessageSafety(text) {
  const content = typeof text === 'string' ? text.trim() : '';

  if (!content) {
    return { allowed: true };
  }

  const controller = new AbortController();
  // Set a 5 second timeout so chat doesn't lag if AI space is sleeping/down
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(MODERATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: content }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(`[AI Safety] Moderation service returned status ${response.status}. Allowing message through.`);
      return { allowed: true };
    }

    const payload = await response.json();
    return normalizeModerationResponse(payload);
  } catch (error) {
    // If the service is sleeping, network error, or timed out, gracefully fallback
    console.warn(`[AI Safety] Moderation service unreachable or timed out (${error.message}). Allowing message through.`);
    return { allowed: true };
  } finally {
    clearTimeout(timeout);
  }
}