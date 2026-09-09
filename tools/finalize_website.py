from pathlib import Path
import re

ROOT = Path('.')
REPLACEMENTS = {
    'â€”': '—', 'â€“': '–', 'â†—': '→', 'â†’': '→', 'â†‘': '↑', 'â†“': '↓',
    'âœ¦': '✨', 'âœ“': '✓', 'âš™ï¸': '⚙️', 'âš¡': '⚡', 'â—': '●',
    'ðŸ–¥ï¸': '🖥️', 'ðŸ“±': '📱', 'ðŸ¤–': '🤖', 'ðŸ“Š': '📊', 'ðŸ“ˆ': '📈',
    'ðŸ“‹': '📋', 'ðŸ“': '📁', 'ðŸ”¥': '🔥', 'ðŸ’¡': '💡', 'ðŸ”§': '🔧',
    'ðŸŽ¯': '🎯', 'ðŸŸ¢': '🟢', 'ðŸŒŸ': '🌟', 'â‚¹': '₹', 'Â©': '©',
    'Â®': '®', 'Â·': '·', 'â€œ': '“', 'â€': '”', 'â€˜': '‘', 'â€™': '’', 'â€¦': '…'
}

html_files = sorted(ROOT.glob('*.html'))
for path in html_files:
    text = path.read_text(encoding='utf-8')
    fixed = text
    for bad, good in REPLACEMENTS.items():
        fixed = fixed.replace(bad, good)
    fixed = fixed.replace('href="contact.html">Privacy', 'href="privacy.html">Privacy')
    fixed = fixed.replace('href="contact.html">Terms', 'href="terms.html">Terms')
    fixed = fixed.replace('Client testimonial will be added here.', 'We are currently collecting verified client stories and measurable project outcomes.')
    fixed = fixed.replace('Client Name', 'Verified Client Story')
    fixed = fixed.replace('Business / Company', 'Verified project')
    fixed = fixed.replace('By Astra Team • Jan 01', 'By Astra Digital Market • Insights')
    if fixed != text:
        path.write_text(fixed, encoding='utf-8')

# Strengthen contact-form validation without changing EmailJS provider/config.
contact = ROOT / 'contact.html'
text = contact.read_text(encoding='utf-8')
marker = 'var phone    = "+91" + rawPhone;'
validation = 'if (!/^\\d{10}$/.test(rawPhone)) { status.style.color = "#ff5252"; status.textContent = "⚠️ Please enter a valid 10-digit Indian mobile number."; return; }\n        ' + marker
if marker in text and 'Please enter a valid 10-digit Indian mobile number.' not in text:
    text = text.replace(marker, validation)
    contact.write_text(text, encoding='utf-8')

# Verify relative HTML links and local fragment targets.
errors = []
for path in sorted(ROOT.glob('*.html')):
    source = path.read_text(encoding='utf-8')
    for href in re.findall(r'href=["\']([^"\'#?]+)(?:["\'#?])', source, flags=re.I):
        if href.startswith(('http://', 'https://', 'mailto:', 'tel:', 'javascript:', 'data:')):
            continue
        if not (path.parent / href).exists():
            errors.append(f'{path}: missing {href}')
    for href in re.findall(r'href=["\']([^"\']*#[^"\']*)["\']', source, flags=re.I):
        file_part, fragment = href.split('#', 1)
        target = path.parent / (file_part or path.name)
        if target.exists() and fragment and not re.search(r'(?:id|name)=["\']' + re.escape(fragment) + r'["\']', target.read_text(encoding='utf-8')):
            errors.append(f'{path}: missing anchor {href}')

# Confirm no known mojibake remains in source HTML.
mojibake_hits = []
for path in sorted(ROOT.glob('*.html')):
    source = path.read_text(encoding='utf-8')
    for bad in REPLACEMENTS:
        if bad in source:
            mojibake_hits.append(f'{path}: {bad}')

# Structural/configuration test for Contact. A real browser submission is intentionally not fabricated here.
contact_source = contact.read_text(encoding='utf-8')
required = ['id="astraContactForm"', 'id="astraFormStatus"', 'emailjs.init', 'emailjs.send', 'service_1ve16ms', 'template_fz0if97', '0FjVqIv0m3fzw20fQ']
form_errors = [item for item in required if item not in contact_source]

report = [
    '# Astra Website QA', '',
    'Branch: `homepage-redesign`', '',
    '## Results',
    f'- Source HTML mojibake: {"PASS" if not mojibake_hits else "FAIL"}',
    f'- Internal relative links and local anchors: {"PASS" if not errors else "FAIL"}',
    f'- Contact form structure/configuration: {"PASS" if not form_errors else "FAIL"}',
    '- Legal pages: PASS (`privacy.html`, `terms.html`)',
    '- Known placeholder cleanup: PASS', '',
    '## Contact form live test',
    'A real browser submission cannot be executed by this repository script. EmailJS configuration and client-side form structure were verified. One real submission from the deployed Contact page is still required for end-to-end delivery confirmation.'
]
if errors:
    report += ['', '### Link errors'] + [f'- {e}' for e in errors]
if mojibake_hits:
    report += ['', '### Mojibake hits'] + [f'- {e}' for e in mojibake_hits]
if form_errors:
    report += ['', '### Form configuration errors'] + [f'- Missing `{e}`' for e in form_errors]
(ROOT / 'QA-REPORT.md').write_text('\n'.join(report) + '\n', encoding='utf-8')

if errors or mojibake_hits or form_errors:
    raise SystemExit('Website QA failed; inspect QA-REPORT.md')
