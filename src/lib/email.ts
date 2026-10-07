// Email checks that catch the typos which make an address undeliverable
// (e.g. "name@gmail..com", "name@gmial.com"), so people fix them before submitting.
// Keep isValidEmail in sync with FixNGBackend/src/utils/emailValidation.js.

const EMAIL_RE = /^[^\s@.]+(?:\.[^\s@.]+)*@[^\s@.]+(?:\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

export function isValidEmail(email: string): boolean {
  const e = email.trim();
  return e.length <= 254 && EMAIL_RE.test(e);
}

const COMMON_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'yahoo.co.uk', 'ymail.com'];

// Edit distance where swapping two neighbouring letters ("gmial") counts as ONE typo — small strings only
function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }
  return dp[a.length][b.length];
}

/** If the domain is one typo away from a popular provider, return the corrected address. */
export function suggestEmailFix(email: string): string | null {
  const e = email.trim().toLowerCase();
  const at = e.lastIndexOf('@');
  if (at < 1) return null;
  const local = e.slice(0, at);
  const domain = e.slice(at + 1).replace(/\.{2,}/g, '.');
  if (COMMON_DOMAINS.includes(domain)) return domain === e.slice(at + 1) ? null : `${local}@${domain}`;
  const close = COMMON_DOMAINS.find((d) => distance(domain, d) === 1);
  return close ? `${local}@${close}` : null;
}
