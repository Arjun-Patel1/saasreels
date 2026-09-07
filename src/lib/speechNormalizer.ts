/**
 * Speech Normalizer: Converts written shorthand, symbols, numbers, currencies,
 * and technical abbreviations into natural, phonetically correct human speech text
 * with authentic conversational emotion, natural contractions, and rhythm.
 */

export function normalizeTextForSpeech(text: string): string {
  let normalized = text.trim();

  // 0. Eliminate Narrative Fluff (Open immediately with high tension / direct value)
  normalized = normalized.replace(
    /^(?:(?:hey|hi|hello)\s+(?:guys|everyone|there|all)[,!.]*\s*|(?:so\s+)?(?:the other day|yesterday|last week)\s*,?\s*|i was (?:on a podcast|talking to a friend|thinking)\s*(?:when|about)?\s*|(?:a lot of people|people always)\s+ask me\s*(?:how|why|what)?\s*|(?:in this video|today)\s*,?\s*(?:i(?:'m| am) (?:gonna|going to) (?:show|tell) you|we are talking about)\s*|have you ever wondered\s*)/i,
    ''
  );

  // 1. Currency, Multipliers & Frequency (e.g. $2,000/mo -> two thousand dollars a month, $500k -> five hundred thousand dollars)
  normalized = normalized.replace(/\$(\d+(?:,\d+)*(?:\.\d+)?)\s*k\/mo\b/gi, (_, amount) => {
    const spokenNum = numberToWords(amount.replace(/,/g, ''));
    return `${spokenNum} thousand dollars a month`;
  });

  normalized = normalized.replace(/\$(\d+(?:,\d+)*(?:\.\d+)?)\s*k\b/gi, (_, amount) => {
    const spokenNum = numberToWords(amount.replace(/,/g, ''));
    return `${spokenNum} thousand dollars`;
  });

  normalized = normalized.replace(/\$(\d+(?:,\d+)*(?:\.\d+)?)\s*m\b/gi, (_, amount) => {
    const spokenNum = numberToWords(amount.replace(/,/g, ''));
    return `${spokenNum} million dollars`;
  });

  normalized = normalized.replace(/\$(\d+(?:,\d+)*(?:\.\d+)?)\/mo\b/gi, (_, amount) => {
    const spokenNum = numberToWords(amount.replace(/,/g, ''));
    return `${spokenNum} dollars a month`;
  });

  normalized = normalized.replace(/\$(\d+(?:,\d+)*(?:\.\d+)?)\/yr\b/gi, (_, amount) => {
    const spokenNum = numberToWords(amount.replace(/,/g, ''));
    return `${spokenNum} dollars a year`;
  });

  normalized = normalized.replace(/\$(\d+(?:,\d+)*(?:\.\d+)?)/g, (_, amount) => {
    const spokenNum = numberToWords(amount.replace(/,/g, ''));
    return `${spokenNum} dollars`;
  });

  // 2. Multipliers & Metrics (e.g. 10x -> ten x, 5k -> five thousand)
  normalized = normalized.replace(/\b(\d+)x\b/gi, (_, num) => `${numberToWords(num)} x`);
  normalized = normalized.replace(/\b(\d+)k\b/gi, (_, num) => `${numberToWords(num)} thousand`);
  normalized = normalized.replace(/\b(\d+)m\b/gi, (_, num) => `${numberToWords(num)} million`);

  // 3. Comprehensive Tech & Financial Phonetic Dictionary
  normalized = normalized.replace(/\bSaaSReels\b/gi, 'Sass Reels');
  normalized = normalized.replace(/\bSaaS\b/gi, 'Sass');
  normalized = normalized.replace(/\bSAS\b/g, 'Sass');
  normalized = normalized.replace(/\bmrr\b/gi, 'M-R-R');
  normalized = normalized.replace(/\barr\b/gi, 'A-R-R');
  normalized = normalized.replace(/\bapis\b/gi, 'A-P-Is');
  normalized = normalized.replace(/\bapi\b/gi, 'A-P-I');
  normalized = normalized.replace(/\bui\/ux\b/gi, 'U-I U-X');
  normalized = normalized.replace(/\bpostgres\b/gi, 'Post-gress');
  normalized = normalized.replace(/\bsupabase\b/gi, 'Soopa-base');
  normalized = normalized.replace(/\bnext\.?js\b/gi, 'Next J S');
  normalized = normalized.replace(/\bgraphql\b/gi, 'Graph Q L');
  normalized = normalized.replace(/\bopen-source\b|\bopensource\b/gi, 'open source');
  normalized = normalized.replace(/\bno-code\b|\bnocode\b/gi, 'no code');
  normalized = normalized.replace(/\bb2b\b/gi, 'B to B');
  normalized = normalized.replace(/\bb2c\b/gi, 'B to C');
  normalized = normalized.replace(/\broi\b/gi, 'R-O-I');
  normalized = normalized.replace(/\bseo\b/gi, 'S-E-O');
  normalized = normalized.replace(/\bcpc\b/gi, 'C-P-C');
  normalized = normalized.replace(/\bctr\b/gi, 'C-T-R');
  normalized = normalized.replace(/\bcto\b/gi, 'C-T-O');
  normalized = normalized.replace(/\bceo\b/gi, 'C-E-O');
  normalized = normalized.replace(/\bugc\b/gi, 'U-G-C');
  normalized = normalized.replace(/\burl\b/gi, 'U-R-L');
  normalized = normalized.replace(/\bfyp\b/gi, 'F-Y-P');
  normalized = normalized.replace(/\bcta\b/gi, 'call to action');
  normalized = normalized.replace(/\bllms\b/gi, 'L-L-Ms');
  normalized = normalized.replace(/\bllm\b/gi, 'L-L-M');
  normalized = normalized.replace(/\ba\.i\b|\bai\b/gi, 'A-I');

  // 4. URL & Domain Phonetic Normalization (e.g. https://supabase.com -> supabase dot com)
  normalized = normalized.replace(/https?:\/\/(?:www\.)?([a-zA-Z0-9.-]+)(?:\/[^\s]*)?/gi, '$1');
  normalized = normalized.replace(/([a-zA-Z0-9]+)\.com\b/gi, '$1 dot com');
  normalized = normalized.replace(/([a-zA-Z0-9]+)\.io\b/gi, '$1 dot I-O');
  normalized = normalized.replace(/([a-zA-Z0-9]+)\.app\b/gi, '$1 dot app');
  normalized = normalized.replace(/([a-zA-Z0-9]+)\.dev\b/gi, '$1 dot dev');
  normalized = normalized.replace(/([a-zA-Z0-9]+)\.ai\b/gi, '$1 dot A-I');

  // 5. Hyphenated compound tech phrases
  normalized = normalized.replace(/\burl-to-viral-video\b/gi, 'U R L to viral video');
  normalized = normalized.replace(/\btinder-style\b/gi, 'Tinder style');
  normalized = normalized.replace(/\bbuilt-in\b/gi, 'built in');
  normalized = normalized.replace(/\bshort-form\b/gi, 'short form');

  // 6. Standalone Numbers to Words (e.g. 2,000 -> two thousand, 30 -> thirty, 4 -> four)
  normalized = normalized.replace(/\b\d+(?:,\d+)*\b/g, (numStr) => {
    const rawNum = numStr.replace(/,/g, '');
    return numberToWords(rawNum);
  });

  // 7. Conversational Human Contractions for natural flow
  normalized = normalized.replace(/\bhere is\b/gi, "here's");
  normalized = normalized.replace(/\bthat is\b/gi, "that's");
  normalized = normalized.replace(/\bit is\b/gi, "it's");
  normalized = normalized.replace(/\bwhat is\b/gi, "what's");
  normalized = normalized.replace(/\bdo not\b/gi, "don't");
  normalized = normalized.replace(/\bcannot\b|\bcan not\b/gi, "can't");
  normalized = normalized.replace(/\byou are\b/gi, "you're");
  normalized = normalized.replace(/\bwe are\b/gi, "we're");
  normalized = normalized.replace(/\blet us\b/gi, "let's");

  // 8. Strip out non-ASCII, double quotes, or weird ellipses (preserve single quotes for contractions)
  normalized = normalized.replace(/[^\x20-\x7E]/g, ' '); // Keep only standard printable ASCII
  normalized = normalized.replace(/\.{2,}/g, '. '); // Replace ellipses '...' with a single clean period
  normalized = normalized.replace(/!{2,}/g, '! ');
  normalized = normalized.replace(/\?{2,}/g, '? ');
  normalized = normalized.replace(/[,;]{2,}/g, ', ');
  normalized = normalized.replace(/["“”«»]/g, ''); // Strip outer speech quotes

  // 9. Ensure clean spacing and punctuation boundaries
  normalized = normalized.replace(/\s*([.,!?])\s*/g, '$1 ');
  return normalized.replace(/\s+/g, ' ').trim();
}

/**
 * Converts integers up to millions into clean English words
 */
function numberToWords(numStr: string): string {
  const num = parseInt(numStr, 10);
  if (isNaN(num)) return numStr;
  if (num === 0) return 'zero';

  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const rem = num % 10;
    return tens[Math.floor(num / 10)] + (rem > 0 ? ' ' + ones[rem] : '');
  }
  if (num < 1000) {
    const rem = num % 100;
    return ones[Math.floor(num / 100)] + ' hundred' + (rem > 0 ? ' ' + numberToWords(rem.toString()) : '');
  }
  if (num < 1000000) {
    const thousands = Math.floor(num / 1000);
    const rem = num % 1000;
    return numberToWords(thousands.toString()) + ' thousand' + (rem > 0 ? ' ' + numberToWords(rem.toString()) : '');
  }
  if (num < 1000000000) {
    const millions = Math.floor(num / 1000000);
    const rem = num % 1000000;
    return numberToWords(millions.toString()) + ' million' + (rem > 0 ? ' ' + numberToWords(rem.toString()) : '');
  }

  return numStr;
}
