/* Office exports use editable text and the supplied EDOS chapter layouts. */
(() => {
  'use strict';
  const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const OFFICE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const RELS = 'http://schemas.openxmlformats.org/package/2006/relationships';
  const TYPES = 'http://schemas.openxmlformats.org/package/2006/content-types';
  const WORD = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const WTYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.';
  const PTYPE = 'application/vnd.openxmlformats-officedocument.presentationml.';
  const AUTHOR = 'Dr. Yash Munnalal Gupta';

  function esc(value) {
    return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }
  function relationship(id, type, target) {
    return '<Relationship Id="' + id + '" Type="' + type + '" Target="' + target + '"/>';
  }
  function override(path, type) {
    return '<Override PartName="/' + path + '" ContentType="' + type + '"/>';
  }
  function relations(entries) {
    return XML + '<Relationships xmlns="' + RELS + '">' + entries.join('') + '</Relationships>';
  }
  function run(text, properties = '') {
    const parts = String(text ?? '').split(/\r?\n/).map(line => '<w:t xml:space="preserve">' + esc(line) + '</w:t>');
    return '<w:r>' + properties + parts.join('<w:br/>') + '</w:r>';
  }
  function paragraph(style, value, options = '') {
    return '<w:p><w:pPr><w:pStyle w:val="' + style + '"/>' + options + '</w:pPr>' + run(value) + '</w:p>';
  }
  function style(id, name, size, color, extra = '', space = 100) {
    const props = '<w:rPr><w:color w:val="' + color + '"/><w:sz w:val="' + size + '"/>' + extra + '</w:rPr>';
    return '<w:style w:type="paragraph" w:styleId="' + id + '"><w:name w:val="' + name +
      '"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="' + space + '"/></w:pPr>' + props + '</w:style>';
  }
  function styles() {
    return XML + '<w:styles xmlns:w="' + WORD + '"><w:docDefaults><w:rPrDefault><w:rPr>' +
      '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="24"/><w:lang w:val="en-GB"/>' +
      '</w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="100" w:line="280" w:lineRule="auto"/>' +
      '</w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal">' +
      '<w:name w:val="Normal"/></w:style>' +
      style('Title', 'Title', 45, '141B19', '<w:b/>', 130) +
      style('Heading1', 'Heading 1', 30, '20564B', '<w:b/>', 85) +
      style('Question', 'Question', 24, '152B26', '<w:b/>', 65) +
      style('Label', 'Label', 20, '286455', '<w:b/>', 55) +
      style('Meta', 'Lesson details', 21, '435952', '', 115) +
      style('Help', 'Language help', 22, '345E51', '<w:i/>', 50) +
      style('Footer', 'Footer', 18, '586B64', '', 0) + '</w:styles>';
  }
  const keep = '<w:keepNext/>';
  function docBody(draft, teacher) {
    const total = draft.items.reduce((sum, item) => sum + Number(item.marks || 0), 0);
    const detail = [String(draft.course).toLowerCase() === 'grammar' ? 'Grammar' : 'Course ' + draft.course,
      draft.level, draft.minutes ? draft.minutes + ' minutes' : '', draft.form ? 'Form ' + draft.form : '',
      total ? total + ' marks' : ''].filter(Boolean).join('  ·  ');
    const content = [
      paragraph('Label', 'EDOS BioEnglish  /  ' + (teacher ? 'Lecturer key' : 'Student ' + (String(draft.type).toLowerCase() === 'exam' || String(draft.type).toLowerCase() === 'assessment' ? 'assessment' : 'worksheet')), keep),
      paragraph('Title', draft.title, keep),
      paragraph('Meta', detail),
      ...(!teacher ? [paragraph('Meta', 'Name ____________________________________     Date __________________')] : []),
      paragraph('Heading1', 'Learning goal', keep),
      paragraph('Normal', draft.objective)
    ];
    if (draft.context) content.push(paragraph('Heading1', 'Read this first', keep), paragraph('Normal', draft.context));
    content.push(paragraph('Heading1', teacher ? 'Answers and marking' : 'Your tasks', keep));
    draft.items.forEach((q, i) => {
      const points = Number(q.marks || 0);
      content.push(paragraph('Question', (i + 1) + '. ' + q.prompt +
        (points ? '  [' + points + (points === 1 ? ' mark]' : ' marks]') : ''), keep));
      if (teacher) {
        content.push(paragraph('Normal', q.answer));
      } else {
        if (q.hint && !/independent/i.test(draft.level)) content.push(paragraph('Help', 'Help: ' + q.hint, keep));
        const lines = points >= 3 ? 3 : points === 1 ? 1 : 2;
        const rule = ' w:val="single" w:sz="4" w:space="1" w:color="B5C6BE"/>';
        const borders = '<w:pBdr><w:bottom' + rule + '<w:between' + rule + '</w:pBdr>';
        for (let line = 1; line <= lines; line++) {
          const spaceAfter = line === lines ? 140 : 0;
          content.push(paragraph('Normal', '', (line < lines ? keep : '') + borders +
            '<w:spacing w:before="0" w:after="' + spaceAfter + '" w:line="330" w:lineRule="exact"/>'));
        }
      }
    });
    return content.join('');
  }
  async function asBlob(zip, mime) {
    return new Blob([await zip.generateAsync({type: 'uint8array', compression: 'DEFLATE'})], {type: mime});
  }
  async function word(draft, audience = 'student') {
    if (!['student', 'teacher'].includes(audience)) throw new Error('Choose the student copy or lecturer key.');
    if (!Array.isArray(draft.items) || !draft.items.length) throw new Error('Add at least one task to the document.');
    const zip = new globalThis.JSZip();
    zip.file('[Content_Types].xml', XML + '<Types xmlns="' + TYPES + '"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
      override('word/document.xml', WTYPE + 'document.main+xml') + override('word/styles.xml', WTYPE + 'styles+xml') +
      override('word/footer1.xml', WTYPE + 'footer+xml') +
      override('docProps/core.xml', 'application/vnd.openxmlformats-package.core-properties+xml') + '</Types>');
    zip.file('_rels/.rels', relations([relationship('rId1', OFFICE + '/officeDocument', 'word/document.xml'),
      relationship('rId2', 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties', 'docProps/core.xml')]));
    zip.file('docProps/core.xml', XML + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>' +
      esc(draft.title) + '</dc:title><dc:creator>' + AUTHOR + '</dc:creator></cp:coreProperties>');
    zip.file('word/_rels/document.xml.rels', relations([relationship('rId1', OFFICE + '/styles', 'styles.xml'), relationship('rId2', OFFICE + '/footer', 'footer1.xml')]));
    zip.file('word/styles.xml', styles());
    zip.file('word/document.xml', XML + '<w:document xmlns:w="' + WORD + '" xmlns:r="' + OFFICE + '"><w:body>' +
      docBody(draft, audience === 'teacher') +
      '<w:sectPr><w:footerReference w:type="default" r:id="rId2"/><w:pgSz w:w="11906" w:h="16838"/>' +
      '<w:pgMar w:top="1100" w:right="1160" w:bottom="1150" w:left="1160" w:header="520" w:footer="540" w:gutter="0"/></w:sectPr></w:body></w:document>');
    zip.file('word/footer1.xml', XML + '<w:ftr xmlns:w="' + WORD + '"><w:p><w:pPr><w:pStyle w:val="Footer"/></w:pPr>' +
      run('EDOS BioEnglish  ·  © ' + AUTHOR + '     |     ') +
      '<w:fldSimple w:instr="PAGE">' + run('1') + '</w:fldSimple></w:p></w:ftr>');
    return asBlob(zip, WTYPE + 'document');
  }

  // Each EDOS source deck uses named text boxes on the same two native layouts.
  // Keep the original paragraph properties, text box placement, theme and fonts.
  function fillSlide(template, fields) {
    const seen = new Set();
    const slide = template.replace(/<p:sp>[\s\S]*?<\/p:sp>/g, shape => {
      const id = /<p:cNvPr\b[^>]* name="Text (\d+)"/.exec(shape)?.[1];
      if (!Object.prototype.hasOwnProperty.call(fields, id)) return shape;
      seen.add(id);
      const lines = fields[id];
      return shape.replace(/<a:p>[\s\S]*<\/a:p>/, block => {
        const model = block.match(/<a:p>[\s\S]*?<\/a:p>/)[0];
        return lines.map(line => model.replace(/<a:t>[\s\S]*?<\/a:t>/, () => '<a:t>' + esc(line) + '</a:t>')).join('');
      });
    });
    if (seen.size !== Object.keys(fields).length) throw new Error('This PowerPoint has an unsupported slide layout.');
    return slide;
  }
  function wrapLine(text, limit) {
    const result = [];
    let current = '';
    for (const word of String(text).split(/\s+/).filter(Boolean)) {
      if (current && current.length + word.length + 1 > limit) { result.push(current); current = ''; }
      if (word.length > limit) {
        if (current) {result.push(current); current = '';}
        for (let offset = 0; offset < word.length; offset += limit) result.push(word.slice(offset, offset + limit));
      } else current = current ? current + ' ' + word : word;
    }
    if (current) result.push(current);
    return result;
  }
  function contentPages(slides) {
    const result = [];
    for (const slide of slides) {
      const lines = (slide.body || []).flatMap(value => String(value).split(/\r?\n/))
        .flatMap(line => wrapLine(line, 67));
      for (let start = 0; start < Math.max(lines.length, 1); start += 6) {
        result.push({title: slide.title, body: lines.slice(start, start + 6)});
      }
    }
    return result;
  }
  async function slides(draft, lesson, sourceBytes) {
    if (!Array.isArray(draft.slides) || !draft.slides.length) throw new Error('Add at least one teaching slide.');
    if (!sourceBytes) {
      const response = await (globalThis.StudioFiles ? StudioFiles.read(lesson.ppt) : fetch(lesson.ppt));
      if (!response.ok) throw new Error('Could not open the chapter PowerPoint. Please try again.');
      sourceBytes = await response.arrayBuffer();
    }
    const zip = await globalThis.JSZip.loadAsync(sourceBytes);
    const paths = ['ppt/slides/slide1.xml', 'ppt/slides/slide2.xml', 'ppt/slides/_rels/slide2.xml.rels',
      'ppt/presentation.xml', 'ppt/_rels/presentation.xml.rels', '[Content_Types].xml', 'docProps/core.xml'];
    const [cover, page, slideRels, presentation, presRels, contentTypes, core] =
      await Promise.all(paths.map(path => zip.file(path).async('string')));
    const pages = contentPages(draft.slides);
    const count = pages.length + 1;
    // Discard source slide bodies and speaker notes before rebuilding the slide list.
    zip.remove('ppt/slides');
    zip.remove('ppt/notesSlides');
    const pageRels = slideRels.replace(/<Relationship\b[^>]*Type="[^"]*\/notesSlide"[^>]*\/>/g, '');
    const descriptions = [
      {...(draft.sectionLabel ? {4: [draft.sectionLabel]} : {}), 5: [draft.title], 6: [draft.objective]},
      ...pages.map((entry, i) => ({
        1: ['EDOS BioEnglish · ' + (i + 1) + ' / ' + pages.length], 3: [entry.title],
        4: entry.body.length ? entry.body : ['']
      }))
    ];
    const slideIds = [], links = [], overrides = [];
    descriptions.forEach((fields, i) => {
      const n = i + 1, path = 'ppt/slides/slide' + n + '.xml';
      const slide = fillSlide(i ? page : cover, fields).replace(/<p:cSld name="[^"]*"/, '<p:cSld name="Slide ' + n + '"');
      zip.file(path, slide);
      zip.file('ppt/slides/_rels/slide' + n + '.xml.rels', pageRels);
      slideIds.push('<p:sldId id="' + (255 + n) + '" r:id="rIdMaterial' + n + '"/>');
      links.push(relationship('rIdMaterial' + n, OFFICE + '/slide', 'slides/slide' + n + '.xml'));
      overrides.push(override(path, PTYPE + 'slide+xml'));
    });
    zip.file('ppt/presentation.xml', presentation.replace(/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/,
      '<p:sldIdLst>' + slideIds.join('') + '</p:sldIdLst>'));
    zip.file('ppt/_rels/presentation.xml.rels', presRels.replace(/<Relationship\b[^>]*Type="[^"]*\/slide"[^>]*\/>/g, '')
      .replace('</Relationships>', links.join('') + '</Relationships>'));
    zip.file('[Content_Types].xml', contentTypes.replace(/<Override\b[^>]*\/>/g, entry => {
      const part = /PartName="\/([^"]+)"/.exec(entry)?.[1];
      return part && zip.file(part) && !part.startsWith('ppt/slides/') ? entry : '';
    }).replace('</Types>', overrides.join('') + '</Types>'));
    zip.file('docProps/app.xml', XML + '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">' +
      '<Application>EDOS BioEnglish Teaching Studio</Application><PresentationFormat>On-screen Show (16:9)</PresentationFormat>' +
      '<Slides>' + count + '</Slides><Notes>0</Notes></Properties>');
    zip.file('docProps/core.xml', core.replace(/<dc:title>.*?<\/dc:title>/, () => '<dc:title>' + esc(draft.title) + '</dc:title>'));
    return asBlob(zip, PTYPE + 'presentation');
  }
  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = name;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  globalThis.StudioOffice = Object.freeze({word, slides, download});
})();
