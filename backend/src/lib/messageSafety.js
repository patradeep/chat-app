const MODERATION_URL = 'https://deep9933-toxic-dector.hf.space/predict';

function normalizeModerationResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    return { allowed: false, reason: 'Unable to verify message safety' };
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

  if (safeFlag === true) {
    return { allowed: true };
  }

  if (safeFlag === false || unsafeFlag === true) {
    return { allowed: false, reason: payload.message || 'Message flagged as unsafe' };
  }

  if (typeof verdict === 'string') {
    const normalized = verdict.toLowerCase();
    const unsafeLabels = ['toxic', 'unsafe', 'unsafe_content', 'hate', 'harassment', 'abuse', 'offensive', 'spam'];
    const safeLabels = ['safe', 'non-toxic', 'non_toxic', 'benign', 'not_toxic', 'not-toxic', 'clean'];

    if (unsafeLabels.includes(normalized)) {
      return { allowed: false, reason: payload.message || 'Message flagged as unsafe' };
    }

    if (safeLabels.includes(normalized)) {
      return { allowed: true };
    }
  }

  if (typeof payload.score === 'number') {
    return payload.score >= 0.5
      ? { allowed: false, reason: 'Message flagged as unsafe' }
      : { allowed: true };
  }

  return { allowed: false, reason: payload.message || 'Unable to verify message safety' };
}

export async function checkMessageSafety(text) {
  const content = typeof text === 'string' ? text.trim() : '';

  if (!content) {
    return { allowed: true };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

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
      return { allowed: false, reason: 'Unable to verify message safety' };
    }

    const payload = await response.json();
    return normalizeModerationResponse(payload);
  } catch (error) {
    if (error?.name === 'AbortError') {
      return { allowed: false, reason: 'Message safety check timed out' };
    }

    return { allowed: false, reason: 'Unable to verify message safety' };
  } finally {
    clearTimeout(timeout);
  }
}