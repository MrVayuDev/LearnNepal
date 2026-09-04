/**
 * LearnNepal — Universal Question Bank Engine v1.0
 * A data-driven, schema-flexible rendering engine for any exam structure.
 *
 * Architecture:
 *   QBEngine.init(config) → load → normalize → buildUI → render
 *
 * The engine NEVER assumes:
 *   - A fixed number of groups, sets, or exam types
 *   - A specific language mode
 *   - A specific question format
 *   - Hard-coded years, chapters, or subjects
 *
 * Everything is derived from the data.
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     §1  UTILITIES
     ═══════════════════════════════════════════════════════════ */

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function escHtml(s) {
    if (typeof s !== 'string') return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function createElement(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'className') el.className = attrs[k];
        else if (k === 'innerHTML') el.innerHTML = attrs[k];
        else if (k === 'textContent') el.textContent = attrs[k];
        else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else el.setAttribute(k, attrs[k]);
      });
    }
    if (children) {
      if (typeof children === 'string') el.innerHTML = children;
      else if (Array.isArray(children)) children.forEach(function (c) { if (c) el.appendChild(c); });
    }
    return el;
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  function unique(arr) {
    var seen = {};
    return arr.filter(function (v) {
      if (seen[v]) return false;
      seen[v] = true;
      return true;
    });
  }

  /* ═══════════════════════════════════════════════════════════
     §2  DATA NORMALIZER
     Converts any legacy format into the universal internal model.
     ═══════════════════════════════════════════════════════════ */

  function normalizeDataset(raw) {
    if (!raw) return null;

    // Already normalized?
    if (raw._normalized) return raw;

    var ds = {
      _normalized: true,
      classId: raw.classId || raw.class || '',
      className: raw.className || '',
      subjectId: raw.subjectId || raw.subject || '',
      subjectName: raw.subjectName || raw.subject || '',
      languageMode: raw.languageMode || raw.language || detectLanguageMode(raw),
      lastUpdated: raw.lastUpdated || '',
      chapters: normalizeChapters(raw),
      exams: []
    };

    // Determine structure type and normalize accordingly
    if (raw.exams && Array.isArray(raw.exams)) {
      // Already has exam hierarchy
      ds.exams = raw.exams.map(normalizeExam);
    } else if (raw.structureType === 'section' && raw.sections) {
      // English/Nepali legacy: sections → exams grouped by year|examType
      var sectionExams = normalizeSectionBasedToExam(raw);
      ds.exams = Array.isArray(sectionExams) ? sectionExams : [sectionExams];
    } else if (raw.structureType === 'group' && raw.groups) {
      // Computer legacy: groups → exams grouped by year|examType
      var groupExams = normalizeGroupBasedToExam(raw);
      ds.exams = Array.isArray(groupExams) ? groupExams : [groupExams];
    } else if (raw.groups && !raw.structureType) {
      // Science legacy: flat groups with year/examType at top
      ds.exams = [normalizeFlatGroupToExam(raw)];
    }

    // Collect all questions flat for filtering
    ds._allQuestions = collectAllQuestions(ds);

    return ds;
  }

  function detectLanguageMode(raw) {
    if (raw.language === 'english' || raw.languageMode === 'english') return 'english';
    if (raw.languageMode === 'nepali') return 'nepali';
    if (raw.languageMode === 'bilingual') return 'bilingual';
    // Detect from data
    var json = JSON.stringify(raw).slice(0, 2000);
    if (json.indexOf('"nepali"') > -1 && json.indexOf('"english"') > -1) return 'bilingual';
    return 'english';
  }

  function normalizeChapters(raw) {
    if (raw.chapters && Array.isArray(raw.chapters)) {
      return raw.chapters.map(function (c) {
        return { id: c.id || c.chapterId || '', name: c.name || c.chapterName || '' };
      });
    }
    // Extract chapters from groups if present
    var chapters = {};
    var groups = raw.groups || [];
    groups.forEach(function (g) {
      var qs = g.questions || [];
      qs.forEach(function (q) {
        if (q.chapterId && !chapters[q.chapterId]) {
          chapters[q.chapterId] = { id: q.chapterId, name: q.chapterId.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }) };
        }
      });
    });
    var arr = Object.keys(chapters).map(function (k) { return chapters[k]; });
    return arr.length ? arr : [];
  }

  function normalizeExam(exam) {
    return {
      year: String(exam.year || ''),
      examType: normalizeExamType(exam.examType),
      fullMarks: exam.fullMarks || null,
      duration: exam.duration || '',
      instructions: normalizeContentArray(exam.instructions),
      sets: (exam.sets || []).map(normalizeSet)
    };
  }

  function normalizeExamType(et) {
    if (!et) return { id: 'regular', name: 'Regular Examination' };
    if (typeof et === 'string') {
      return { id: et.toLowerCase(), name: et.charAt(0).toUpperCase() + et.slice(1) + (et.toLowerCase() === 'regular' || et.toLowerCase() === 'supplementary' ? ' Examination' : '') };
    }
    return { id: et.id || 'regular', name: et.name || et.id || 'Regular' };
  }

  function normalizeSet(set) {
    return {
      id: set.id || 'single',
      name: set.name || 'Question Paper',
      groups: (set.groups || []).map(normalizeGroup)
    };
  }

  function normalizeGroup(group) {
    return {
      id: group.id || '',
      name: group.name || '',
      questionType: group.questionType || group.type || '',
      totalMarks: group.totalMarks || group.marks || null,
      instruction: normalizeInstruction(group.instruction),
      questions: (group.questions || []).map(function (q) { return normalizeQuestion(q, group); })
    };
  }

  function normalizeInstruction(inst) {
    if (!inst) return null;
    if (typeof inst === 'string') return { value: inst };
    if (inst.english || inst.nepali) return { english: inst.english, nepali: inst.nepali };
    return inst;
  }

  function normalizeQuestion(q, group) {
    var nq = {
      id: q.id || '',
      questionNumber: String(q.questionNumber || q.questionNo || ''),
      marks: q.marks || null,
      chapterId: q.chapterId || '',
      topicId: q.topicId || '',
      tags: q.tags || [],
      difficulty: q.difficulty || null,
      // Attach group metadata for filtering
      _groupId: group ? (group.id || '') : '',
      _groupName: group ? (group.name || '') : '',
      _questionType: q.questionType || (group ? (group.questionType || group.type || '') : ''),
      // Exam context (filled during collection)
      _year: '',
      _examTypeId: '',
      _examTypeName: '',
      _setId: '',
      _setName: '',
      // Legacy fields
      _section: q.section || '',
      _subCategory: q.subCategory || '',
      _literatureWork: q.literatureWork || ''
    };

    // Normalize question content
    nq.question = normalizeQuestionContent(q.question || q.questionText || q);

    // Normalize options
    nq.options = normalizeOptions(q.options);

    // Normalize correct answer
    nq.correctAnswer = normalizeCorrectAnswer(q.correctAnswer);

    // Normalize answer/solution
    nq.answer = normalizeAnswerContent(q.answer, q.solution);

    // Normalize subquestions
    nq.subQuestions = q.subQuestions ? q.subQuestions.map(function (sq) { return normalizeQuestion(sq, null); }) : [];

    // Normalize choice
    nq.choice = q.choice || null;

    return nq;
  }

  function normalizeQuestionContent(q) {
    if (!q) return { content: [] };

    // Already has content array
    if (q.content && Array.isArray(q.content)) {
      return { content: q.content.map(normalizeContentBlock) };
    }

    // Bilingual object: { english: "...", nepali: "..." }
    if (typeof q === 'object' && (q.english || q.nepali)) {
      return {
        content: [{
          type: 'text',
          english: q.english || '',
          nepali: q.nepali || ''
        }]
      };
    }

    // Plain string
    if (typeof q === 'string') {
      return { content: [{ type: 'text', value: q }] };
    }

    return { content: [] };
  }

  function normalizeAnswerContent(answer, solution) {
    if (!answer && !solution) return null;

    // answer has content blocks
    if (answer && answer.content && Array.isArray(answer.content)) {
      return { content: answer.content.map(normalizeContentBlock) };
    }

    // Bilingual answer: { english: "...", nepali: "..." }
    if (answer && typeof answer === 'object' && (answer.english || answer.nepali)) {
      return {
        content: [{
          type: 'text',
          english: answer.english || '',
          nepali: answer.nepali || ''
        }]
      };
    }

    // HTML string answer
    if (typeof answer === 'string') {
      return { content: [{ type: 'text', value: answer, _html: true }] };
    }

    // Solution fallback (legacy)
    if (typeof solution === 'string') {
      return { content: [{ type: 'text', value: solution }] };
    }

    return null;
  }

  function normalizeContentBlock(block) {
    if (!block) return { type: 'text', value: '' };
    if (typeof block === 'string') return { type: 'text', value: block };
    // Ensure type exists
    var nb = Object.assign({}, block);
    if (!nb.type) nb.type = 'text';
    return nb;
  }

  function normalizeContentArray(arr) {
    if (!arr) return [];
    if (typeof arr === 'string') return [{ type: 'text', value: arr }];
    if (Array.isArray(arr)) return arr.map(normalizeContentBlock);
    if (typeof arr === 'object' && (arr.english || arr.nepali)) {
      return [{ type: 'text', english: arr.english, nepali: arr.nepali }];
    }
    return [];
  }

  function normalizeOptions(opts) {
    if (!opts || !Array.isArray(opts)) return [];
    return opts.map(function (opt) {
      if (typeof opt === 'string') {
        return { id: '', content: [{ type: 'text', value: opt }] };
      }
      var o = { id: opt.id || '' };
      if (opt.content && Array.isArray(opt.content)) {
        o.content = opt.content.map(normalizeContentBlock);
      } else if (opt.text) {
        o.content = [{ type: 'text', value: opt.text }];
      } else if (opt.english || opt.nepali) {
        o.content = [{ type: 'text', english: opt.english || '', nepali: opt.nepali || '' }];
      } else {
        o.content = [{ type: 'text', value: String(opt.value || '') }];
      }
      return o;
    });
  }

  function normalizeCorrectAnswer(ca) {
    if (!ca) return [];
    if (Array.isArray(ca)) return ca;
    if (typeof ca === 'string') {
      if (ca === 'not-stated') return [];
      return [ca];
    }
    return [];
  }

  /* ── Legacy format converters ─────────────────────── */

  function normalizeSectionBasedToExam(raw) {
    // Group questions by year+examType
    var examMap = {};
    (raw.sections || []).forEach(function (sec) {
      (sec.questions || []).forEach(function (q) {
        var yr = String(q.year || q.yearBS || 'unknown');
        var et = q.examType || 'regular';
        var key = yr + '|' + et;
        if (!examMap[key]) {
          examMap[key] = { year: yr, examType: et, groups: {} };
        }
        var sid = sec.sectionId || 'default';
        if (!examMap[key].groups[sid]) {
          examMap[key].groups[sid] = {
            id: 'section-' + sid,
            name: (sec.sectionName ? 'Section ' + sid + ': ' + sec.sectionName : 'Section ' + sid),
            questionType: '',
            totalMarks: sec.marks || null,
            color: sec.color || null,
            questions: []
          };
        }
        examMap[key].groups[sid].questions.push(q);
      });
    });

    // Build exams array
    var exams = Object.keys(examMap).map(function (key) {
      var e = examMap[key];
      var groups = Object.keys(e.groups).map(function (gid) {
        return normalizeGroup(e.groups[gid]);
      });
      return {
        year: e.year,
        examType: normalizeExamType(e.examType),
        fullMarks: raw.fullMarks || null,
        duration: raw.duration || '',
        instructions: [],
        sets: [{
          id: 'single',
          name: 'Question Paper',
          groups: groups
        }]
      };
    });

    // If no exam grouping possible, return single exam
    if (exams.length === 0) {
      var groups = (raw.sections || []).map(function (sec) {
        return normalizeGroup({
          id: 'section-' + (sec.sectionId || ''),
          name: sec.sectionName || '',
          questionType: '',
          totalMarks: sec.marks || null,
          questions: sec.questions || []
        });
      });
      return {
        year: '',
        examType: normalizeExamType('regular'),
        fullMarks: null,
        duration: '',
        instructions: [],
        sets: [{ id: 'single', name: 'Question Paper', groups: groups }]
      };
    }

    // Return all exams but they need to be at the dataset level
    // We'll return the first and put the rest back
    return exams;
  }

  function normalizeGroupBasedToExam(raw) {
    // Group questions by year+examType within each group
    var examMap = {};
    (raw.groups || []).forEach(function (grp) {
      (grp.questions || []).forEach(function (q) {
        var yr = String(q.year || 'unknown');
        var et = q.examType || 'regular';
        var key = yr + '|' + et;
        if (!examMap[key]) {
          examMap[key] = { year: yr, examType: et, groups: {} };
        }
        var gid = grp.id || 'default';
        if (!examMap[key].groups[gid]) {
          examMap[key].groups[gid] = {
            id: gid,
            name: grp.name || '',
            questionType: grp.questionType || '',
            instruction: grp.instruction || null,
            questions: []
          };
        }
        examMap[key].groups[gid].questions.push(q);
      });
    });

    var exams = Object.keys(examMap).map(function (key) {
      var e = examMap[key];
      var groups = Object.keys(e.groups).map(function (gid) {
        return normalizeGroup(e.groups[gid]);
      });
      // Sort groups to maintain original order
      var origOrder = (raw.groups || []).map(function (g) { return g.id; });
      groups.sort(function (a, b) { return origOrder.indexOf(a.id) - origOrder.indexOf(b.id); });
      return {
        year: e.year,
        examType: normalizeExamType(e.examType),
        fullMarks: raw.fullMarks || null,
        duration: raw.duration || '',
        instructions: normalizeContentArray(raw.instructions),
        sets: [{ id: 'single', name: 'Question Paper', groups: groups }]
      };
    });

    return exams;
  }

  function normalizeFlatGroupToExam(raw) {
    var groups = (raw.groups || []).map(normalizeGroup);
    return {
      year: String(raw.year || ''),
      examType: normalizeExamType(raw.examType),
      fullMarks: raw.fullMarks || null,
      duration: raw.duration || '',
      instructions: normalizeContentArray(raw.instructions),
      sets: [{
        id: 'single',
        name: 'Question Paper',
        groups: groups
      }]
    };
  }

  /* ── Collect all questions (flattened for filtering) ─ */

  function collectAllQuestions(ds) {
    var all = [];
    var exams = ds.exams || [];
    exams.forEach(function (exam) {
      (exam.sets || []).forEach(function (set) {
        (set.groups || []).forEach(function (group) {
          (group.questions || []).forEach(function (q) {
            q._year = exam.year;
            q._examTypeId = exam.examType.id;
            q._examTypeName = exam.examType.name;
            q._setId = set.id;
            q._setName = set.name;
            q._groupId = q._groupId || group.id;
            q._groupName = q._groupName || group.name;
            q._questionType = q._questionType || group.questionType;
            all.push(q);
          });
        });
      });
    });
    return all;
  }

  /* ═══════════════════════════════════════════════════════════
     §3  DATA VALIDATION
     ═══════════════════════════════════════════════════════════ */

  function validateDataset(ds) {
    var warnings = [];
    var ids = {};

    (ds._allQuestions || []).forEach(function (q) {
      if (!q.id) warnings.push('Question missing id: ' + JSON.stringify(q.question).slice(0, 60));
      else if (ids[q.id]) warnings.push('Duplicate question id: ' + q.id);
      else ids[q.id] = true;

      if (!q.questionNumber) warnings.push('Question ' + (q.id || '?') + ' missing questionNumber');
    });

    if (warnings.length) {
      console.warn('[QBEngine] Validation warnings (' + warnings.length + '):');
      warnings.forEach(function (w) { console.warn('  • ' + w); });
    }
    return warnings;
  }

  /* ═══════════════════════════════════════════════════════════
     §4  FILTER ENGINE
     ═══════════════════════════════════════════════════════════ */

  function getUniqueValues(questions, key) {
    return unique(questions.map(function (q) { return q[key]; }).filter(Boolean));
  }

  function getAvailableFilters(questions) {
    return {
      years: getUniqueValues(questions, '_year').sort(function (a, b) { return b.localeCompare(a); }),
      examTypes: unique(questions.map(function (q) { return q._examTypeId + '|' + q._examTypeName; })).map(function (s) {
        var parts = s.split('|');
        return { id: parts[0], name: parts[1] };
      }),
      sets: unique(questions.map(function (q) { return q._setId + '|' + q._setName; })).map(function (s) {
        var parts = s.split('|');
        return { id: parts[0], name: parts[1] };
      }),
      groups: unique(questions.map(function (q) { return q._groupId + '|' + q._groupName; })).map(function (s) {
        var parts = s.split('|');
        return { id: parts[0], name: parts[1] };
      }),
      chapters: unique(questions.filter(function (q) { return q.chapterId; }).map(function (q) { return q.chapterId; })),
      questionTypes: unique(questions.map(function (q) { return q._questionType; }).filter(Boolean))
    };
  }

  function filterQuestions(questions, filters) {
    return questions.filter(function (q) {
      if (filters.year && filters.year !== 'all' && q._year !== filters.year) return false;
      if (filters.examType && filters.examType !== 'all' && q._examTypeId !== filters.examType) return false;
      if (filters.set && filters.set !== 'all' && q._setId !== filters.set) return false;
      if (filters.group && filters.group !== 'all' && q._groupId !== filters.group) return false;
      if (filters.chapter && filters.chapter !== 'all' && q.chapterId !== filters.chapter) return false;
      if (filters.questionType && filters.questionType !== 'all' && q._questionType !== filters.questionType) return false;
      if (filters.search) {
        var s = filters.search.toLowerCase();
        var searchable = getSearchableText(q).toLowerCase();
        if (searchable.indexOf(s) === -1) return false;
      }
      return true;
    });
  }

  function getSearchableText(q) {
    var parts = [];
    // Question content
    if (q.question && q.question.content) {
      q.question.content.forEach(function (b) {
        if (b.value) parts.push(b.value);
        if (b.english) parts.push(b.english);
        if (b.nepali) parts.push(b.nepali);
      });
    }
    // Answer content
    if (q.answer && q.answer.content) {
      q.answer.content.forEach(function (b) {
        if (b.value) parts.push(b.value);
        if (b.english) parts.push(b.english);
        if (b.nepali) parts.push(b.nepali);
      });
    }
    // Options
    if (q.options) {
      q.options.forEach(function (o) {
        (o.content || []).forEach(function (b) {
          if (b.value) parts.push(b.value);
          if (b.english) parts.push(b.english);
          if (b.nepali) parts.push(b.nepali);
        });
      });
    }
    // Metadata
    parts.push(q.chapterId || '');
    parts.push((q.tags || []).join(' '));
    parts.push(q._year || '');
    parts.push(q._groupName || '');
    parts.push(q.questionNumber || '');
    parts.push(q._subCategory || '');
    parts.push(q._literatureWork || '');
    return parts.join(' ');
  }

  /* ═══════════════════════════════════════════════════════════
     §5  URL STATE MANAGER
     ═══════════════════════════════════════════════════════════ */

  var URLState = {
    read: function () {
      var params = new URLSearchParams(window.location.search);
      return {
        year: params.get('year') || 'all',
        examType: params.get('exam') || 'all',
        set: params.get('set') || 'all',
        group: params.get('group') || 'all',
        chapter: params.get('chapter') || 'all',
        questionType: params.get('type') || 'all',
        search: params.get('q') || ''
      };
    },
    write: function (filters) {
      var params = new URLSearchParams();
      if (filters.year && filters.year !== 'all') params.set('year', filters.year);
      if (filters.examType && filters.examType !== 'all') params.set('exam', filters.examType);
      if (filters.set && filters.set !== 'all') params.set('set', filters.set);
      if (filters.group && filters.group !== 'all') params.set('group', filters.group);
      if (filters.chapter && filters.chapter !== 'all') params.set('chapter', filters.chapter);
      if (filters.questionType && filters.questionType !== 'all') params.set('type', filters.questionType);
      if (filters.search) params.set('q', filters.search);
      var qs = params.toString();
      var newUrl = window.location.pathname + (qs ? '?' + qs : '');
      if (window.location.search !== (qs ? '?' + qs : '')) {
        window.history.pushState(null, '', newUrl);
      }
    }
  };

  /* ═══════════════════════════════════════════════════════════
     §6  CONTENT BLOCK RENDERER
     One universal renderer for questions AND answers.
     ═══════════════════════════════════════════════════════════ */

  function renderContentBlocks(blocks, lang) {
    if (!blocks || !blocks.length) return '';
    return blocks.map(function (block) {
      return renderContentBlock(block, lang);
    }).join('');
  }

  function renderContentBlock(block, lang) {
    if (!block) return '';
    switch (block.type) {
      case 'text': return renderTextBlock(block, lang);
      case 'image': return renderImageBlock(block, lang);
      case 'svg': return renderSvgBlock(block);
      case 'table': return renderTableBlock(block, lang);
      case 'formula': return renderFormulaBlock(block);
      case 'code': return renderCodeBlock(block);
      case 'list': return renderListBlock(block, lang);
      case 'chart': return renderChartBlock(block);
      case 'divider': return '<hr class="qbe-divider">';
      case 'quote': return '<blockquote class="qbe-quote">' + escHtml(getLocalizedText(block, lang)) + '</blockquote>';
      default:
        console.warn('[QBEngine] Unknown content block type: ' + block.type);
        return '<div class="qbe-unknown-block">[Unsupported content type: ' + escHtml(block.type) + ']</div>';
    }
  }

  function getLocalizedText(block, lang) {
    if (!block) return '';
    // Direct value
    if (block.value !== undefined) return block.value;
    // Bilingual
    if (lang === 'nepali' && block.nepali) return block.nepali;
    if (lang === 'english' && block.english) return block.english;
    // Fallback order
    return block.english || block.nepali || block.value || '';
  }

  function getLocalizedField(field, lang) {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (lang === 'nepali' && field.nepali) return field.nepali;
    if (lang === 'english' && field.english) return field.english;
    return field.english || field.nepali || field.value || '';
  }

  function renderTextBlock(block, lang) {
    var text = getLocalizedText(block, lang);
    if (!text) return '';
    // If it's raw HTML from legacy data
    if (block._html) {
      return '<div class="qbe-text-block qbe-html-content">' + text + '</div>';
    }
    // Preserve line breaks
    return '<div class="qbe-text-block">' + escHtml(text).replace(/\n/g, '<br>') + '</div>';
  }

  function renderImageBlock(block, lang) {
    var src = block.src || '';
    var alt = getLocalizedField(block.alt, lang);
    var caption = getLocalizedField(block.caption, lang);
    var width = block.width ? ' width="' + block.width + '"' : '';
    var height = block.height ? ' height="' + block.height + '"' : '';

    var html = '<figure class="qbe-image-block">';
    html += '<img src="' + escHtml(src) + '" alt="' + escHtml(alt) + '"' + width + height;
    html += ' loading="lazy" class="qbe-img" onclick="QBEngine._openLightbox(this)">';
    if (caption) {
      html += '<figcaption class="qbe-img-caption">' + escHtml(caption) + '</figcaption>';
    }
    html += '</figure>';
    return html;
  }

  function renderSvgBlock(block) {
    if (!block.src) return '';
    return '<figure class="qbe-svg-block"><img src="' + escHtml(block.src) + '" alt="' + escHtml(block.alt || 'Diagram') + '" class="qbe-svg" loading="lazy"></figure>';
  }

  function renderTableBlock(block, lang) {
    var headers = block.headers || [];
    var rows = block.rows || [];
    var caption = getLocalizedField(block.caption, lang);

    var html = '<div class="qbe-table-scroll"><table class="qbe-table">';
    if (caption) html += '<caption>' + escHtml(caption) + '</caption>';

    if (headers.length) {
      html += '<thead><tr>';
      headers.forEach(function (h) {
        html += '<th>' + escHtml(getLocalizedField(h, lang)) + '</th>';
      });
      html += '</tr></thead>';
    }

    html += '<tbody>';
    rows.forEach(function (row) {
      html += '<tr>';
      (Array.isArray(row) ? row : [row]).forEach(function (cell) {
        html += '<td>' + escHtml(getLocalizedField(cell, lang)) + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }

  function renderFormulaBlock(block) {
    var latex = block.latex || block.value || '';
    if (!latex) return '';
    // Try KaTeX if available
    if (typeof katex !== 'undefined') {
      try {
        return '<div class="qbe-formula-block">' + katex.renderToString(latex, { throwOnError: false, displayMode: true }) + '</div>';
      } catch (e) {
        console.warn('[QBEngine] KaTeX error:', e);
      }
    }
    // Fallback: show raw LaTeX in monospace
    return '<div class="qbe-formula-block qbe-formula-raw"><code>' + escHtml(latex) + '</code></div>';
  }

  function renderCodeBlock(block) {
    var code = block.code || block.value || '';
    var language = block.language || '';
    return '<div class="qbe-code-block"><div class="qbe-code-header"><span class="qbe-code-lang">' + escHtml(language.toUpperCase()) + '</span></div><pre><code class="language-' + escHtml(language) + '">' + escHtml(code) + '</code></pre></div>';
  }

  function renderListBlock(block, lang) {
    var style = block.style || 'unordered';
    var items = block.items || [];
    var tag = style === 'ordered' ? 'ol' : 'ul';
    var html = '<' + tag + ' class="qbe-list-block">';
    items.forEach(function (item) {
      html += '<li>' + escHtml(getLocalizedField(item, lang)) + '</li>';
    });
    html += '</' + tag + '>';
    return html;
  }

  function renderChartBlock(block) {
    // Placeholder for Chart.js integration
    var title = block.title || 'Chart';
    return '<div class="qbe-chart-block"><div class="qbe-chart-placeholder"><span class="qbe-chart-icon">📊</span><span>' + escHtml(title) + '</span><small>Chart rendering requires Chart.js</small></div></div>';
  }

  /* ═══════════════════════════════════════════════════════════
     §7  QUESTION RENDERER
     ═══════════════════════════════════════════════════════════ */

  function renderQuestion(q, lang, seqNum) {
    var html = '<article class="qbe-question" id="q-' + escHtml(q.id) + '">';

    // Question header
    html += '<div class="qbe-q-header">';
    html += '<span class="qbe-q-num">' + escHtml(String(seqNum || q.questionNumber || '')) + '.</span>';

    // Meta badges
    html += '<div class="qbe-q-badges">';
    if (q._year) html += '<span class="qbe-badge qbe-badge-year">' + escHtml(q._year) + '</span>';
    if (q._examTypeId && q._examTypeId !== 'regular') {
      html += '<span class="qbe-badge qbe-badge-exam">' + escHtml(q._examTypeName || q._examTypeId) + '</span>';
    }
    if (q.marks) html += '<span class="qbe-badge qbe-badge-marks">' + q.marks + ' Mark' + (q.marks > 1 ? 's' : '') + '</span>';
    if (q._questionType) html += '<span class="qbe-badge qbe-badge-type">' + escHtml(formatQuestionType(q._questionType)) + '</span>';
    if (q.chapterId) html += '<span class="qbe-badge qbe-badge-chapter">' + escHtml(formatChapterId(q.chapterId)) + '</span>';
    html += '</div>';
    html += '</div>';

    // Question content
    html += '<div class="qbe-q-content">';
    if (q.question && q.question.content) {
      html += renderContentBlocks(q.question.content, lang);
    }
    html += '</div>';

    // MCQ Options
    if (q.options && q.options.length) {
      html += renderMcqOptions(q, lang);
    }

    // Subquestions
    if (q.subQuestions && q.subQuestions.length) {
      html += '<div class="qbe-subquestions">';
      q.subQuestions.forEach(function (sq, idx) {
        html += '<div class="qbe-subquestion">';
        html += '<span class="qbe-sq-num">' + escHtml(sq.questionNumber || String.fromCharCode(97 + idx)) + ')</span>';
        if (sq.marks) html += '<span class="qbe-badge qbe-badge-marks qbe-sq-marks">' + sq.marks + '</span>';
        html += '<div class="qbe-sq-content">';
        if (sq.question && sq.question.content) {
          html += renderContentBlocks(sq.question.content, lang);
        }
        // Subquestion options
        if (sq.options && sq.options.length) {
          html += renderMcqOptions(sq, lang);
        }
        // Subquestion answer
        if (sq.answer) {
          html += renderAnswerToggle(sq, lang);
        }
        html += '</div></div>';
      });
      html += '</div>';
    }

    // Internal choice
    if (q.choice) {
      html += renderChoice(q.choice, lang);
    }

    // Answer toggle
    if (q.answer && q.answer.content && q.answer.content.length) {
      html += renderAnswerToggle(q, lang);
    }

    html += '</article>';
    return html;
  }

  function renderMcqOptions(q, lang) {
    var html = '<div class="qbe-options">';
    q.options.forEach(function (opt) {
      var letter = opt.id || '';
      html += '<div class="qbe-option" data-option="' + escHtml(letter) + '">';
      html += '<span class="qbe-option-letter">' + escHtml(letter.toUpperCase()) + '</span>';
      html += '<span class="qbe-option-text">' + renderContentBlocks(opt.content || [], lang) + '</span>';
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  function renderAnswerToggle(q, lang) {
    var answerId = 'ans-' + q.id;
    var html = '<div class="qbe-answer-section">';

    // Toggle button
    html += '<button class="qbe-ans-toggle" aria-expanded="false" aria-controls="' + answerId + '" onclick="QBEngine._toggleAnswer(\'' + escHtml(q.id) + '\')">';
    html += '<svg class="qbe-ans-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
    html += '<span>View Solution</span>';
    html += '</button>';

    // Answer body (collapsed)
    html += '<div class="qbe-ans-body" id="' + answerId + '" hidden>';

    // Correct answer indicator for MCQ
    if (q.correctAnswer && q.correctAnswer.length) {
      html += '<div class="qbe-correct-answer">Correct Answer: <strong>' + q.correctAnswer.map(function (a) { return a.toUpperCase(); }).join(', ') + '</strong></div>';
    }

    // Answer content
    if (q.answer && q.answer.content) {
      html += '<div class="qbe-ans-content">' + renderContentBlocks(q.answer.content, lang) + '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function renderChoice(choice, lang) {
    if (!choice || !choice.questions) return '';
    var html = '<div class="qbe-choice">';
    if (choice.instruction) {
      html += '<div class="qbe-choice-instruction">' + escHtml(getLocalizedField(choice.instruction, lang)) + '</div>';
    }
    choice.questions.forEach(function (cq, idx) {
      if (idx > 0) {
        html += '<div class="qbe-choice-or"><span>OR</span></div>';
      }
      html += '<div class="qbe-choice-option">';
      if (cq.question && cq.question.content) {
        html += renderContentBlocks(cq.question.content, lang);
      }
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  function formatQuestionType(type) {
    var map = {
      'mcq': 'MCQ', 'short': 'Short Answer', 'long': 'Long Answer',
      'very-short': 'Very Short', 'numerical': 'Numerical',
      'programming': 'Programming', 'theory': 'Theory'
    };
    return map[type] || type.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function formatChapterId(id) {
    return id.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  /* ═══════════════════════════════════════════════════════════
     §8  GROUP / SET / EXAM RENDERERS
     ═══════════════════════════════════════════════════════════ */

  function renderGroupHeader(group, lang) {
    var html = '<div class="qbe-group-header">';
    html += '<div class="qbe-group-badge" style="background: var(--accent)">' + escHtml(group.id.replace('group-', '').replace('section-', '').toUpperCase()) + '</div>';
    html += '<h2 class="qbe-group-name">' + escHtml(group.name) + '</h2>';
    if (group.totalMarks) {
      html += '<span class="qbe-group-marks">' + group.totalMarks + ' Marks</span>';
    }
    if (group.questionType) {
      html += '<span class="qbe-group-type">' + escHtml(formatQuestionType(group.questionType)) + '</span>';
    }
    html += '</div>';

    // Group instruction
    if (group.instruction) {
      var inst = getLocalizedField(group.instruction, lang);
      if (inst) {
        html += '<div class="qbe-group-instruction">' + escHtml(inst) + '</div>';
      }
    }

    return html;
  }

  function renderExamHeader(exam, lang) {
    var html = '<div class="qbe-exam-header">';
    html += '<div class="qbe-exam-meta">';
    if (exam.year) html += '<span class="qbe-exam-year">' + escHtml(exam.year) + '</span>';
    html += '<span class="qbe-exam-type">' + escHtml(exam.examType.name) + '</span>';
    if (exam.fullMarks) html += '<span class="qbe-exam-fm">Full Marks: ' + exam.fullMarks + '</span>';
    if (exam.duration) html += '<span class="qbe-exam-dur">' + escHtml(exam.duration) + '</span>';
    html += '</div>';

    // Instructions
    if (exam.instructions && exam.instructions.length) {
      html += '<div class="qbe-exam-instructions">' + renderContentBlocks(exam.instructions, lang) + '</div>';
    }

    html += '</div>';
    return html;
  }

  /* ═══════════════════════════════════════════════════════════
     §9  MAIN ENGINE — UI BUILDER & CONTROLLER
     ═══════════════════════════════════════════════════════════ */

  var Engine = {
    config: null,
    dataset: null,
    filters: { year: 'all', examType: 'all', set: 'all', group: 'all', chapter: 'all', questionType: 'all', search: '' },
    lang: 'english',
    containerEl: null,
    filterEl: null,

    init: function (config) {
      Engine.config = config;
      Engine.lang = config.defaultLang || 'english';

      Engine.containerEl = $(config.contentSelector || '#qbe-content');
      Engine.filterEl = $(config.filterSelector || '#qbe-filters');

      if (!Engine.containerEl) {
        console.error('[QBEngine] Content container not found:', config.contentSelector);
        return;
      }

      // Read URL state
      Engine.filters = URLState.read();

      // Read language from localStorage
      var savedLang = localStorage.getItem('qbe-lang');
      if (savedLang) Engine.lang = savedLang;

      // Load data
      Engine.loadData(config.dataUrl);

      // Listen for popstate (back/forward)
      window.addEventListener('popstate', function () {
        Engine.filters = URLState.read();
        Engine.render();
        Engine.syncFilterUI();
      });
    },

    loadData: function (url) {
      Engine.containerEl.innerHTML = '<div class="qbe-loading"><div class="qbe-loading-spinner"></div><p>Loading questions…</p></div>';

      fetch(url)
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (raw) {
          Engine.dataset = normalizeDataset(raw);
          validateDataset(Engine.dataset);
          Engine.buildUI();
          Engine.render();
          Engine.updateStats();
        })
        .catch(function (err) {
          console.error('[QBEngine] Load error:', err);
          Engine.containerEl.innerHTML = '<div class="qbe-error"><div class="qbe-error-icon"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><h3>Unable to Load Questions</h3><p>Check your connection and try again.</p><button class="qbe-retry-btn" onclick="window.location.reload()">Retry</button></div>';
        });
    },

    buildUI: function () {
      var ds = Engine.dataset;
      if (!ds) return;

      // Build language toggle (only for bilingual)
      if (ds.languageMode === 'bilingual') {
        Engine.buildLanguageToggle();
      }

      // Build filter panel
      Engine.buildFilters();
    },

    buildLanguageToggle: function () {
      var toggleContainer = $('#qbe-lang-toggle');
      if (!toggleContainer) return;

      toggleContainer.innerHTML = '';
      toggleContainer.style.display = '';

      var btnEn = createElement('button', {
        className: 'qbe-lang-btn' + (Engine.lang === 'english' ? ' active' : ''),
        textContent: 'English',
        onClick: function () { Engine.setLanguage('english'); }
      });
      var btnNp = createElement('button', {
        className: 'qbe-lang-btn' + (Engine.lang === 'nepali' ? ' active' : ''),
        textContent: 'नेपाली',
        onClick: function () { Engine.setLanguage('nepali'); }
      });

      toggleContainer.appendChild(btnEn);
      toggleContainer.appendChild(btnNp);
    },

    setLanguage: function (lang) {
      Engine.lang = lang;
      localStorage.setItem('qbe-lang', lang);
      Engine.render();
      // Update toggle UI
      $$('.qbe-lang-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.textContent === (lang === 'english' ? 'English' : 'नेपाली'));
      });
    },

    buildFilters: function () {
      var filterEl = Engine.filterEl;
      if (!filterEl) return;

      var ds = Engine.dataset;
      var all = ds._allQuestions || [];
      var avail = getAvailableFilters(all);

      var html = '';

      // Filter toggle (mobile)
      html += '<div class="qbe-filter-toggle" id="qbe-filter-toggle">';
      html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>';
      html += '<span>Filters</span>';
      html += '<span class="qbe-filter-count" id="qbe-filter-count"></span>';
      html += '<svg class="qbe-filter-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
      html += '</div>';

      html += '<div class="qbe-filter-body" id="qbe-filter-body">';

      // Search
      html += '<div class="qbe-filter-search">';
      html += '<svg class="qbe-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
      html += '<input type="text" id="qbe-search" class="qbe-search-input" placeholder="Search questions…" value="' + escHtml(Engine.filters.search) + '">';
      html += '</div>';

      // Year filter
      if (avail.years.length > 1) {
        html += Engine.buildFilterRow('Year', 'year', avail.years.map(function (y) { return { id: y, name: y }; }));
      }

      // Exam type filter
      if (avail.examTypes.length > 1) {
        html += Engine.buildFilterRow('Exam Type', 'examType', avail.examTypes);
      }

      // Set filter
      var realSets = avail.sets.filter(function (s) { return s.id !== 'single'; });
      if (realSets.length > 1) {
        html += Engine.buildFilterRow('Set', 'set', realSets);
      }

      // Group filter
      if (avail.groups.length > 1) {
        html += Engine.buildFilterRow('Group', 'group', avail.groups);
      }

      // Question type filter
      if (avail.questionTypes.length > 1) {
        html += Engine.buildFilterRow('Question Type', 'questionType', avail.questionTypes.map(function (t) { return { id: t, name: formatQuestionType(t) }; }));
      }

      // Chapter filter
      if (avail.chapters.length > 1) {
        html += Engine.buildFilterRow('Chapter', 'chapter', avail.chapters.map(function (c) { return { id: c, name: formatChapterId(c) }; }));
      }

      // Reset button
      html += '<div class="qbe-filter-reset"><button class="qbe-reset-btn" id="qbe-reset">Clear Filters</button></div>';

      html += '</div>'; // end filter-body

      // Active filter chips
      html += '<div class="qbe-active-chips" id="qbe-active-chips"></div>';

      filterEl.innerHTML = html;

      // Bind events
      Engine.bindFilterEvents();
    },

    buildFilterRow: function (label, key, options) {
      var html = '<div class="qbe-filter-group">';
      html += '<span class="qbe-filter-label">' + escHtml(label) + '</span>';
      html += '<div class="qbe-filter-pills">';
      html += '<button class="qbe-pill' + (Engine.filters[key] === 'all' ? ' active' : '') + '" data-filter="' + key + '" data-value="all">All</button>';
      options.forEach(function (opt) {
        html += '<button class="qbe-pill' + (Engine.filters[key] === opt.id ? ' active' : '') + '" data-filter="' + key + '" data-value="' + escHtml(opt.id) + '">' + escHtml(opt.name) + '</button>';
      });
      html += '</div></div>';
      return html;
    },

    bindFilterEvents: function () {
      // Filter toggle (mobile)
      var toggle = $('#qbe-filter-toggle');
      var body = $('#qbe-filter-body');
      if (toggle && body) {
        toggle.addEventListener('click', function () {
          toggle.classList.toggle('open');
          body.classList.toggle('open');
        });
      }

      // Filter pills
      $$('.qbe-pill').forEach(function (pill) {
        pill.addEventListener('click', function () {
          var key = this.dataset.filter;
          var val = this.dataset.value;

          // Update active state in the row
          var row = this.closest('.qbe-filter-pills');
          if (row) $$('.qbe-pill', row).forEach(function (p) { p.classList.remove('active'); });
          this.classList.add('active');

          Engine.filters[key] = val;
          URLState.write(Engine.filters);
          Engine.render();
          Engine.updateChips();
          Engine.updateFilterCount();
        });
      });

      // Search
      var searchInput = $('#qbe-search');
      if (searchInput) {
        searchInput.addEventListener('input', debounce(function () {
          Engine.filters.search = this.value.trim();
          URLState.write(Engine.filters);
          Engine.render();
          Engine.updateChips();
          Engine.updateFilterCount();
        }, 280));
      }

      // Reset
      var resetBtn = $('#qbe-reset');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          Engine.filters = { year: 'all', examType: 'all', set: 'all', group: 'all', chapter: 'all', questionType: 'all', search: '' };
          var si = $('#qbe-search');
          if (si) si.value = '';
          URLState.write(Engine.filters);
          Engine.syncFilterUI();
          Engine.render();
          Engine.updateChips();
          Engine.updateFilterCount();
        });
      }

      // Initial state
      Engine.updateChips();
      Engine.updateFilterCount();
    },

    syncFilterUI: function () {
      $$('.qbe-pill').forEach(function (pill) {
        var key = pill.dataset.filter;
        var val = pill.dataset.value;
        pill.classList.toggle('active', Engine.filters[key] === val);
      });
      var si = $('#qbe-search');
      if (si) si.value = Engine.filters.search || '';
    },

    updateChips: function () {
      var container = $('#qbe-active-chips');
      if (!container) return;

      var html = '';
      var labels = { year: 'Year', examType: 'Exam', set: 'Set', group: 'Group', chapter: 'Chapter', questionType: 'Type' };

      Object.keys(labels).forEach(function (key) {
        if (Engine.filters[key] && Engine.filters[key] !== 'all') {
          var val = Engine.filters[key];
          if (key === 'chapter') val = formatChapterId(val);
          if (key === 'questionType') val = formatQuestionType(val);
          html += '<span class="qbe-chip" data-chip-key="' + key + '">' + labels[key] + ': ' + escHtml(val) + ' <button class="qbe-chip-x" onclick="QBEngine._clearFilter(\'' + key + '\')" aria-label="Remove">&times;</button></span>';
        }
      });

      if (Engine.filters.search) {
        html += '<span class="qbe-chip" data-chip-key="search">"' + escHtml(Engine.filters.search) + '" <button class="qbe-chip-x" onclick="QBEngine._clearFilter(\'search\')" aria-label="Remove">&times;</button></span>';
      }

      if (html) {
        html += '<button class="qbe-chip-clear" onclick="QBEngine._clearAllFilters()">Clear all</button>';
      }

      container.innerHTML = html;
    },

    updateFilterCount: function () {
      var count = 0;
      Object.keys(Engine.filters).forEach(function (k) {
        if (k === 'search') { if (Engine.filters[k]) count++; }
        else { if (Engine.filters[k] !== 'all') count++; }
      });
      var el = $('#qbe-filter-count');
      if (el) {
        el.textContent = count || '';
        el.style.display = count ? '' : 'none';
      }
    },

    /* ── RENDER ────────────────────────────────────── */

    render: function () {
      var ds = Engine.dataset;
      if (!ds || !Engine.containerEl) return;

      var allQs = ds._allQuestions || [];
      var filtered = filterQuestions(allQs, Engine.filters);

      // Update result count
      var countEl = $('#qbe-result-count');
      if (countEl) countEl.innerHTML = 'Showing <strong>' + filtered.length + '</strong> of ' + allQs.length + ' questions';

      if (!filtered.length) {
        Engine.containerEl.innerHTML = '<div class="qbe-empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="8" x2="14" y2="14"/><line x1="14" y1="8" x2="8" y2="14"/></svg><h3>No questions found</h3><p>Try adjusting your filters or search term.</p></div>';
        return;
      }

      // Render in exam/group structure if no cross-exam filter active
      var viewMode = Engine.getViewMode();

      if (viewMode === 'structured') {
        Engine.renderStructured(filtered);
      } else {
        Engine.renderFlat(filtered);
      }
    },

    getViewMode: function () {
      // If specific year + exam type + set are selected, show structured view
      var f = Engine.filters;
      if (f.year !== 'all' && f.examType !== 'all') return 'structured';
      // Default to flat (grouped by year)
      return 'flat';
    },

    renderStructured: function (filtered) {
      var ds = Engine.dataset;
      var html = '';
      var seqNum = 0;
      var filteredIds = {};
      filtered.forEach(function (q) { filteredIds[q.id] = true; });

      ds.exams.forEach(function (exam) {
        // Check if this exam has any filtered questions
        var examHasQuestions = false;

        (exam.sets || []).forEach(function (set) {
          (set.groups || []).forEach(function (group) {
            (group.questions || []).forEach(function (q) {
              if (filteredIds[q.id]) examHasQuestions = true;
            });
          });
        });

        if (!examHasQuestions) return;

        html += renderExamHeader(exam, Engine.lang);

        // Sets
        var visibleSets = (exam.sets || []).filter(function (set) {
          return set.groups.some(function (g) {
            return g.questions.some(function (q) { return filteredIds[q.id]; });
          });
        });

        // Set tabs (only if multiple sets)
        if (visibleSets.length > 1) {
          html += '<div class="qbe-set-tabs">';
          visibleSets.forEach(function (set, idx) {
            html += '<button class="qbe-set-tab' + (idx === 0 ? ' active' : '') + '" data-set="' + escHtml(set.id) + '">' + escHtml(set.name) + '</button>';
          });
          html += '</div>';
        }

        visibleSets.forEach(function (set, idx) {
          html += '<div class="qbe-set-content' + (idx === 0 || visibleSets.length <= 1 ? '' : ' hidden') + '" data-set-content="' + escHtml(set.id) + '">';

          (set.groups || []).forEach(function (group) {
            var groupQs = (group.questions || []).filter(function (q) { return filteredIds[q.id]; });
            if (!groupQs.length) return;

            html += '<section class="qbe-group">';
            html += renderGroupHeader(group, Engine.lang);

            groupQs.forEach(function (q) {
              seqNum++;
              html += renderQuestion(q, Engine.lang, seqNum);
            });

            html += '</section>';
          });

          html += '</div>';
        });
      });

      Engine.containerEl.innerHTML = html;
      Engine.bindSetTabs();
    },

    renderFlat: function (filtered) {
      var html = '';
      var seqNum = 0;

      // Group by year
      var byYear = {};
      filtered.forEach(function (q) {
        var yr = q._year || 'Unknown';
        if (!byYear[yr]) byYear[yr] = [];
        byYear[yr].push(q);
      });

      var years = Object.keys(byYear).sort(function (a, b) { return b.localeCompare(a); });

      years.forEach(function (yr) {
        html += '<div class="qbe-year-divider"><span class="qbe-year-label">' + escHtml(yr) + '</span></div>';

        // Group by group within year
        var byGroup = {};
        var groupOrder = [];
        byYear[yr].forEach(function (q) {
          var gid = q._groupId || 'default';
          if (!byGroup[gid]) { byGroup[gid] = { name: q._groupName || '', questions: [] }; groupOrder.push(gid); }
          byGroup[gid].questions.push(q);
        });

        groupOrder.forEach(function (gid) {
          var grp = byGroup[gid];
          if (grp.name) {
            html += '<div class="qbe-group-mini-header"><strong>' + escHtml(grp.name) + '</strong></div>';
          }
          grp.questions.forEach(function (q) {
            seqNum++;
            html += renderQuestion(q, Engine.lang, seqNum);
          });
        });
      });

      Engine.containerEl.innerHTML = html;
    },

    bindSetTabs: function () {
      $$('.qbe-set-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
          var setId = this.dataset.set;
          var parent = this.closest('.qbe-exam-header') || this.parentElement.parentElement;

          // Find all set tabs and content in this context
          $$('.qbe-set-tab').forEach(function (t) { t.classList.remove('active'); });
          this.classList.add('active');

          $$('.qbe-set-content').forEach(function (c) {
            c.classList.toggle('hidden', c.dataset.setContent !== setId);
          });
        });
      });
    },

    updateStats: function () {
      var ds = Engine.dataset;
      if (!ds) return;
      var totalEl = $('#qbe-stat-total');
      var yearsEl = $('#qbe-stat-years');
      if (totalEl) Engine.animateNumber(totalEl, ds._allQuestions.length);
      if (yearsEl) {
        var years = unique(ds._allQuestions.map(function (q) { return q._year; }).filter(Boolean));
        Engine.animateNumber(yearsEl, years.length);
      }
    },

    animateNumber: function (el, target) {
      var current = 0;
      var step = Math.ceil(target / 30);
      function tick() {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current < target) requestAnimationFrame(tick);
      }
      tick();
    }
  };

  /* ═══════════════════════════════════════════════════════════
     §10  LIGHTBOX
     ═══════════════════════════════════════════════════════════ */

  function openLightbox(imgEl) {
    var overlay = document.createElement('div');
    overlay.className = 'qbe-lightbox';
    overlay.innerHTML = '<div class="qbe-lightbox-inner"><img src="' + imgEl.src + '" alt="' + escHtml(imgEl.alt) + '"><button class="qbe-lightbox-close" aria-label="Close">&times;</button></div>';
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.classList.contains('qbe-lightbox-close')) {
        overlay.classList.add('closing');
        setTimeout(function () { overlay.remove(); }, 200);
      }
    });
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') {
        overlay.classList.add('closing');
        setTimeout(function () { overlay.remove(); }, 200);
        document.removeEventListener('keydown', handler);
      }
    });
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('open'); });
  }

  /* ═══════════════════════════════════════════════════════════
     §11  PUBLIC API
     ═══════════════════════════════════════════════════════════ */

  window.QBEngine = {
    init: function (config) { Engine.init(config); },

    // Internal methods (used by onclick in rendered HTML)
    _toggleAnswer: function (qId) {
      var body = document.getElementById('ans-' + qId);
      var btn = body ? body.previousElementSibling : null;
      if (!body || !btn) return;

      var isHidden = body.hidden;
      body.hidden = !isHidden;
      btn.setAttribute('aria-expanded', String(isHidden));
      btn.classList.toggle('active', isHidden);

      if (isHidden) {
        body.style.display = '';
        // Animate
        body.style.maxHeight = '0px';
        body.style.opacity = '0';
        requestAnimationFrame(function () {
          body.style.transition = 'max-height 0.4s cubic-bezier(.16,1,.3,1), opacity 0.35s ease';
          body.style.maxHeight = body.scrollHeight + 'px';
          body.style.opacity = '1';
        });
      } else {
        body.style.maxHeight = '0px';
        body.style.opacity = '0';
        setTimeout(function () {
          body.style.display = 'none';
          body.style.transition = '';
          body.style.maxHeight = '';
        }, 400);
      }
    },

    _openLightbox: openLightbox,

    _clearFilter: function (key) {
      if (key === 'search') {
        Engine.filters.search = '';
        var si = $('#qbe-search');
        if (si) si.value = '';
      } else {
        Engine.filters[key] = 'all';
      }
      Engine.syncFilterUI();
      URLState.write(Engine.filters);
      Engine.render();
      Engine.updateChips();
      Engine.updateFilterCount();
    },

    _clearAllFilters: function () {
      Engine.filters = { year: 'all', examType: 'all', set: 'all', group: 'all', chapter: 'all', questionType: 'all', search: '' };
      var si = $('#qbe-search');
      if (si) si.value = '';
      Engine.syncFilterUI();
      URLState.write(Engine.filters);
      Engine.render();
      Engine.updateChips();
      Engine.updateFilterCount();
    },

    // Expose for external use
    getDataset: function () { return Engine.dataset; },
    getFilters: function () { return Engine.filters; },
    setFilter: function (key, val) {
      Engine.filters[key] = val;
      URLState.write(Engine.filters);
      Engine.syncFilterUI();
      Engine.render();
      Engine.updateChips();
      Engine.updateFilterCount();
    }
  };

})();
