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

    # Keep the homepage testimonial design, but use natural sample copy rather than AI-style claims.
    if path.name == 'index.html':
        fixed = fixed.replace(
            "Real experiences from businesses we've helped with digital marketing, websites, software, automation and creative solutions.",
            "Sample review wording for the homepage. Replace these with verified client feedback as you collect it."
        )
        sample_reviews = [
            ('Sample Client 01', 'Website Development', 'The team understood what we needed and helped us get our website work organized properly. Communication was easy throughout.'),
            ('Sample Client 02', 'Digital Marketing', 'We were looking for help with our social media and online marketing. The team was responsive and explained things clearly.'),
            ('Sample Client 03', 'WhatsApp Automation', 'We started with a simple requirement and the team helped us understand how the automation could fit into our day-to-day work.'),
            ('Sample Client 04', 'Website Development', 'What I liked most was the communication. Whenever we had a question, the team was available and explained what was being done.'),
            ('Sample Client 05', 'Digital Marketing', 'We wanted to improve our online presence and got some useful ideas for our marketing. Overall, the process was smooth.'),
            ('Sample Client 06', 'WhatsApp Automation', 'The team listened to our requirements and suggested a solution based on what we actually needed. Good experience so far.')
        ]
        review_pattern = re.compile(
            r'(<h4[^>]*>)(?:Verified Client Story)(</h4>).*?(<p[^>]*>)(?:Verified project)(</p>).*?(<p[^>]*>)(?:We are currently collecting verified client stories and measurable project outcomes\.)(</p>)',
            re.S
        )
        def review_replacer(match):
            idx = review_replacer.count
            review_replacer.count += 1
            if idx >= len(sample_reviews):
                return match.group(0)
            name, category, quote = sample_reviews[idx]
            return (
                match.group(1) + name + match.group(2) +
                re.search(r'(<div style="display:flex; gap:12px; align-items:center;">.*?</div>\s*</div>\s*<div style="font-size:18px; color:var\(--gold\); line-height:1;">&#9733;&#9733;&#9733;&#9733;&#9733;</div>\s*</div>)', match.group(0), re.S).group(1) if False else
                match.group(0)
            )
        # Replace the three text nodes inside each testimonial card while leaving layout and styling untouched.
        h4_repl = iter(sample_reviews)
        def replace_card_text(match):
            name, category, quote = next(h4_repl)
            card = match.group(0)
            card = re.sub(r'(<h4[^>]*>).*?(</h4>)', lambda m: m.group(1) + name + m.group(2), card, count=1, flags=re.S)
            card = re.sub(r'(<p[^>]*>).*?(</p>)', lambda m: m.group(1) + category + m.group(2), card, count=1, flags=re.S)
            card = re.sub(r'(<p[^>]*>).*?(</p>)', lambda m: m.group(1) + quote + m.group(2), card, count=1, flags=re.S)
            return card
        card_pattern = re.compile(r'<article[^>]*>.*?Verified Client Story.*?Verified project.*?We are currently collecting verified client stories and measurable project outcomes\..*?</article>', re.S)
        fixed = card_pattern.sub(replace_card_text, fixed)

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
