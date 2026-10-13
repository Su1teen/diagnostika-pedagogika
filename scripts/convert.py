import os, sys, json, re, zipfile, shutil, html as htmllib
import docx
from docx.table import Table
from docx.text.paragraph import Paragraph
from docx.enum.text import WD_ALIGN_PARAGRAPH

sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_MEDIA = r'c:\moms\Проект\java\media'
SRC_DOCX = os.path.join(SRC_MEDIA, 'учебник.docx')
IMAGES = os.path.join(ROOT, 'public', 'assets', 'images')
ORIG = os.path.join(ROOT, 'public', 'originals')
DATA = os.path.join(ROOT, 'src', 'data')
for d in (IMAGES, ORIG, DATA):
    os.makedirs(d, exist_ok=True)

# 1. Originals + static assets (copied unchanged)
for f in os.listdir(SRC_MEDIA):
    shutil.copy2(os.path.join(SRC_MEDIA, f), os.path.join(ORIG, f))
shutil.copy2(os.path.join(SRC_MEDIA, 'Автор.png'), os.path.join(IMAGES, 'Автор.png'))
shutil.copy2(os.path.join(SRC_MEDIA, 'logo.jpg'), os.path.join(IMAGES, 'logo.jpg'))
with zipfile.ZipFile(SRC_DOCX) as z:
    for e in z.infolist():
        if e.filename.startswith('word/media/'):
            open(os.path.join(IMAGES, os.path.basename(e.filename)), 'wb').write(z.read(e))

read = lambda n: open(os.path.join(SRC_MEDIA, n), encoding='utf-8').read().strip()
author_text, preface_text = read('автор.txt'), read('алғы сөз.txt')
json.dump({
    "name": "Есенғұлова Мейрамгүл Нұралықызы",
    "title": "Педагогика ғылымдарының кандидаты, доцент",
    "photo": "./assets/images/Автор.png",
    "bio": author_text,
}, open(os.path.join(DATA, 'author.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
json.dump({"title": "Алғы сөз", "content": preface_text},
          open(os.path.join(DATA, 'preface.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

# 2. Section boundaries (paragraph indexes found by analysing учебник.docx; end exclusive)
SECTIONS = [
    ("front", "Титул", "Баспа мәліметтері", 0, 95),
    ("preface", "Алғы сөз", "Алғы сөз", 95, 107),
    ("ch1", "1-тарау", None, 107, 162),
    ("ch1_2", "1.2", None, 162, 363),
    ("ch1_3", "1.3", None, 363, 547),
    ("ch1_4", "1.4", None, 547, 684),
    ("ch1_5", "1.5", None, 684, 739),
    ("ch2", "2-тарау", None, 739, 795),
    ("ch2_1", "2.1", None, 795, 874),
    ("ch2_2", "2.2", None, 874, 970),
    ("ch2_3", "2.3", None, 970, 998),
    ("ch3", "Практика", "Практикалық сабақтар", 998, 1507),
    ("conclusion", "Қорытынды", "Қорытынды", 1507, 1557),
    ("references", "Әдебиеттер", "Қолданылған әдебиеттер тізімі", 1557, 1591),
]

doc = docx.Document(SRC_DOCX)
blip = {rid: os.path.basename(r.target_ref) for rid, r in doc.part.rels.items() if 'image' in r.target_ref}
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
esc = lambda t: htmllib.escape(t, quote=False)


def para_html(p, idx):
    xml = p._p.xml
    figs = ''.join(
        f'<figure class="book-figure"><img src="./assets/images/{blip[r]}" alt="" class="book-image" loading="lazy" /></figure>'
        for r in re.findall(r'r:embed="([^"]+)"', xml) if r in blip)
    runs = []
    for run in p.runs:
        t = run.text
        if not t:
            continue
        t = esc(t).replace('\t', '&emsp;')
        if run.bold: t = f'<strong>{t}</strong>'
        if run.italic: t = f'<em>{t}</em>'
        if run.underline: t = f'<u>{t}</u>'
        runs.append(t)
    inner = ''.join(runs)
    text = p.text.strip()
    if not text and not figs:
        return '', ''
    cls = []
    if p.alignment == WD_ALIGN_PARAGRAPH.CENTER: cls.append('text-center')
    elif p.alignment == WD_ALIGN_PARAGRAPH.RIGHT: cls.append('text-right')
    if p._p.pPr is not None and p._p.pPr.numPr is not None and not re.match(r'^\s*(\d+[.)]|[а-яa-z]\)|[-–•])', text):
        cls.append('li')
    c = f' class="{" ".join(cls)}"' if cls else ''
    body = f'<p id="p-{idx}"{c}>{inner}</p>' if text else ''
    return text, body + figs


def table_html(t):
    rows = []
    for r in t.rows:
        seen, cells = set(), []
        for c in r.cells:
            if id(c._tc) in seen:
                continue
            seen.add(id(c._tc))
            cells.append('<td>' + '<br/>'.join(esc(p.text.strip()) for p in c.paragraphs if p.text.strip()) + '</td>')
        rows.append('<tr>' + ''.join(cells) + '</tr>')
    return '<div class="table-container"><table class="book-table"><tbody>' + ''.join(rows) + '</tbody></table></div>'


# 3. Walk body in document order, keeping paragraphs and tables where they are
items = []  # (para_index or None, kind, obj)
pi = 0
for child in doc.element.body.iterchildren():
    if child.tag == W + 'p':
        items.append((pi, 'p', Paragraph(child, doc)))
        pi += 1
    elif child.tag == W + 'tbl':
        items.append((pi, 't', Table(child, doc)))  # table sits before paragraph pi

ASSESS = ["бағалау", "оценивание", "критерий", "дескриптор", "формативті", "суммативті", "рефлексия",
          "самоанализ", "самооценка", "обратная связь", "прогресс", "результат", "тест", "тапсырма",
          "сұрақ", "вопрос", "диагностика"]
METHOD = ["әдістемелік", "методическ", "нұсқау", "рекомендаци", "инструкция", "алгоритм", "этап", "схема",
          "подход", "совет", "указание", "план", "стратегия", "метод", "практикалық", "практическ",
          "техника", "прием", "ұсыным"]
assess_items, method_items = [], []

out, toc = [], []
for sid, short, fixed_title, a, b in SECTIONS:
    html_parts, paras, title = [], 0, fixed_title
    for idx, kind, obj in items:
        if not (a <= idx < b):
            continue
        if kind == 't':
            html_parts.append(table_html(obj))
            continue
        text, h = para_html(obj, idx)
        if not h:
            continue
        paras += 1
        if title is None and text and text.strip().upper() != 'ДӘРІСТЕР':
            title = re.sub(r'\s+', ' ', text)
            title = re.sub(r'^1 Кіріспе\.\s*', '1 ', title)
            title = re.sub(r'^(\d+(?:\.\d+)?)\s+Дәріс тақырыбы:\s*', r'\1 ', title)
        html_parts.append(h)
        if len(text) >= 30 and sid not in ('front', 'references'):
            low = text.lower()
            for kw in ASSESS:
                if kw in low:
                    assess_items.append({"id": f"a{idx}", "pNum": idx, "sectionId": sid, "sectionTitle": short,
                                         "keyword": kw, "text": text})
                    break
            for kw in METHOD:
                if kw in low:
                    method_items.append({"id": f"m{idx}", "pNum": idx, "sectionId": sid, "sectionTitle": short,
                                         "keyword": kw, "text": text})
                    break
    title = title or short
    out.append({"id": sid, "tag": sid, "title": title, "shortTitle": short, "numParagraphs": paras,
                "contentHtml": '\n'.join(html_parts)})
    toc.append({"id": sid, "tag": sid, "title": title, "shortTitle": short})
    print(f'{sid:11} paragraphs={paras:4} {title[:70]}')

w = lambda n, o: json.dump(o, open(os.path.join(DATA, n), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
w('book_content.json', out)
w('toc.json', toc)
w('assessment.json', {"title": "Бағалау және рефлексия",
                      "description": "Оқулықтағы өзін-өзі бағалау, бақылау тапсырмалары, критерийлер мен рефлексиялық материалдар",
                      "count": len(assess_items), "items": assess_items})
w('methodical.json', {"title": "Әдістемелік нұсқау",
                      "description": "Арнайы педагогтар мен мамандарға арналған әдістемелер, алгоритмдер мен ұсынымдар",
                      "count": len(method_items), "items": method_items})
print('tables:', sum(1 for i in items if i[1] == 't'), '| assess', len(assess_items), '| method', len(method_items))
