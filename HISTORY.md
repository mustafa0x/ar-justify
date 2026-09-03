# A history of Arabic text justification, especially on the Web

> Last reviewed: September 2026

Arabic justification has an unusual software history. It is an old and central part of Arabic typography; mature desktop software has supported Arabic-specific justification for decades; Internet Explorer exposed a browser-native kashida mode around the beginning of the century; a CSS Candidate Recommendation specified explicit kashida controls; and yet authors cannot reliably request kashida-based justification in modern browsers.

This document traces that history. It explains why Arabic justification is more than inserting U+0640 ARABIC TATWEEL, surveys important standards and implementations, records the sources that led to `ar-justify`, and suggests a practical route toward native CSS support.

This is a historical and technical overview, not a normative specification. Arabic writing styles differ, software changes, and some historical implementation details survive only in archived documentation and source code.

## The short version

A fully justified Arabic line can be fitted by combining several techniques:

- varying spaces between words;
- elongating suitable cursive connections or parts of letterforms;
- selecting wider, narrower, swash, ligated, or stacked forms;
- making small font-specific positioning adjustments;
- changing line breaks across the paragraph;
- in specialized traditional composition, changing word configuration, margins, or scale.

The word **kashida** is often used loosely for all Arabic elongation. It helps to distinguish context-sensitive, style-specific **kashīda** from the literal Unicode character **U+0640 ARABIC TATWEEL** (`ـ`), a straight, join-causing extender. A sophisticated formatter may create elongation without adding U+0640 to the source text, and an authored U+0640 may be meaningful text rather than a transient layout decision.

The Web once had explicit syntax for the problem. Internet Explorer 5.5 supported `text-justify: kashida`, and the [2003 CSS3 Text Candidate Recommendation](https://www.w3.org/TR/2003/CR-css3-text-20030514/) specified both `text-justify: kashida` and `text-kashida-space`, which controlled the balance between kashida expansion and whitespace expansion. That specification never became a Recommendation in that form. The properties disappeared from later CSS Text drafts, and Microsoft's implementation remained tied to its legacy browser engine rather than becoming interoperable Web behavior.

Current CSS gives user agents freedom to use language- and script-appropriate justification under `text-justify: auto`, but it provides no dependable author-facing switch for kashida and no interoperable control over how much expansion should come from elongation rather than spaces. The practical result is that many browser and font combinations still produce conspicuously expanded inter-word spaces.

This does **not** mean Arabic justification is unsolved. Microsoft Word and its file formats, Windows shaping APIs, Adobe applications, OpenOffice and LibreOffice, DecoType's Mushaf Muscat, DigitalKhatt, TeX experiments, and multiple research systems have implemented important parts of it. The unresolved problem is a high-quality, interoperable, semantics-preserving implementation in general-purpose Web engines.

## Terminology

### Justification is a line-fitting system

Full justification makes each line occupy a target measure. Latin typography often achieves this mostly by changing word spaces, sometimes assisted by hyphenation, glyph expansion, or paragraph-wide line breaking. Arabic offers more possibilities because it is cursive and many styles permit controlled changes to connections and letterforms.

Calling the whole process “kashida insertion” hides most of the formatter's work. A useful system must decide:

1. where a line may expand or contract;
2. which opportunities are typographically preferable;
3. how adjustment should be distributed among words;
4. which mechanisms the active font can realize;
5. whether a different line break would improve the paragraph;
6. how the result should respond to width, font, size, language, and content changes;
7. how visual elongation interacts with selection, copying, search, caret movement, accessibility, and printing.

### Kashīda is broader than U+0640

Titus Nemeth's [historical account of Arabic justification](https://research.reading.ac.uk/typoarabic/on-arabic-justification-part-1/) adopts a useful distinction associated with Thomas Milo and DecoType:

- **kashīda**: elongation or reconfiguration of letterforms according to the conventions of a writing style;
- **taṭwīl / tatweel**: the encoded character U+0640, usually rendered as a straight baseline extender.

Unicode classifies U+0640 as **Join_Causing**, like U+200D ZERO WIDTH JOINER. It participates in joining but is not an Arabic letter with initial, medial, final, and isolated forms. See the Unicode Character Database's [`ArabicShaping.txt`](https://www.unicode.org/Public/UCD/latest/ucd/ArabicShaping.txt) and the [Arabic names list](https://www.unicode.org/charts/nameslist/n_0600.html).

Tatweel is useful. It can express an intentional extender, carry combining marks, or give a font a glyph on which to realize an extended connection. It is not, by itself, a complete justification model.

### A valid join is not automatically a good elongation point

A program can use Unicode joining properties to determine whether two clusters connect. That answers a structural question: *could* an extender be inserted without crossing a non-joining boundary? It does not answer the typographic question: *should* this connection be elongated in this word, font, language, and style?

Arabic-script traditions differ substantially. Naskh, Nastaliq, Ruqʿah, Persian, Urdu, Kurdish, Qurʾanic, display, and newspaper settings cannot all use one universal ranking. A shaping engine can identify safe boundaries; a font can provide alternate forms; but a formatter still needs language- and style-sensitive policy.

### Elongation should normally be layout, not source text

If an application inserts literal U+0640 characters into a document merely to fit a particular width, those width-specific decisions become part of the text:

- copied text may include them;
- exact search and indexing may behave differently;
- caret movement gains artificial positions;
- spell checking and text processing see additional characters;
- resizing can make their lengths wrong;
- another font can render them very differently.

A native layout engine should normally keep justification transient. It may use an extender glyph internally, but the DOM, clipboard, search string, and accessibility text should remain the authored text.

That separation creates its own requirements: selection highlighting should cover the visible extension, hit testing should map to real source positions, and printing should reproduce the fitted line. These semantics are part of the Web-platform problem, not cosmetic details.

## Before software

### Manuscript practice

Arabic scribes did not normally solve every short line by inserting a sequence of identical horizontal bars. Depending on the writing style and page, they could vary:

- the length and curvature of connections;
- individual letterforms and contextual alternates;
- ligatures and stacked forms;
- the relative configuration of letters within a word;
- spacing between words;
- the relationship of text to margins and surrounding lines.

Nemeth groups the historical repertoire into three broad families: variation of letterforms, variation of black-and-white density, and variation of word or page configuration. This is a useful corrective to software models that reduce Arabic justification to one encoded character.

### Early printing and mechanical simplification

Straight extender sorts appeared early in European Arabic printing. Nemeth discusses examples from at least the early sixteenth century. Reusable straight pieces were mechanically convenient: a printer could add width without cutting a new contextual form for every situation.

That convenience gradually hardened into a convention. Mechanical composition systems favored operations that could be expressed as predictable substitutions. The straight extender was easier to automate than the fluid repertoire of a calligrapher.

### Hot metal, typewriters, and JusTape

Twentieth-century machinery reinforced the same simplification. Nemeth traces the straight extender through Arabic Linotype, Monotype, typewriters, photocomposition, and early computer-assisted newspaper typesetting.

In the 1960s, Linotype & Machinery and Compugraphic developed an automated system commonly known as **Arabic JusTape**. Substitution tables selected places where extenders could be introduced, allowing justified Arabic newspaper composition to be automated. Nemeth reports that Al-Ahram put such a system into production in 1968.

JusTape was an important engineering achievement. It also illustrates a recurring trade-off: an industrial system can be effective while supporting only a narrow subset of the script's typographic possibilities. Later digital software inherited fonts, expectations, terminology, and algorithms shaped by these earlier machines.

## Digital foundations

### Unicode: characters and joining behavior

Unicode encodes characters in logical order; shaping converts them into contextual glyphs. For Arabic-script text, the `Joining_Type` property distinguishes right-joining, left-joining, dual-joining, join-causing, non-joining, and transparent characters. Combining marks must remain attached to their grapheme cluster. U+200C ZERO WIDTH NON-JOINER and U+200D ZERO WIDTH JOINER can deliberately alter joining behavior.

This model is essential for interchange, editing, accessibility, and search. It also means a formatter cannot infer joining merely from a letter's position inside a whitespace-delimited word. A word such as `دار` contains breaks caused by right-joining letters even though no spaces occur inside it, while a vocalized cluster such as `سَ` must remain indivisible.

The Unicode Character Database provides the stable data needed to identify joining behavior. It does not prescribe a complete line-fitting algorithm or a hierarchy of preferred kashida positions.

### OpenType: font-provided justification machinery

OpenType provides several mechanisms relevant to Arabic justification:

- contextual substitution and positioning through GSUB and GPOS;
- the [`jalt` Justification Alternates feature](https://learn.microsoft.com/en-us/typography/opentype/spec/features_ja#jalt);
- variation axes and feature variations in variable fonts;
- the [`JSTF` justification table](https://learn.microsoft.com/en-us/typography/opentype/spec/jstf).

JSTF lets a font describe prioritized suggestions for shrinking or extending text. A priority can enable or disable substitution and positioning lookups, specify maximum adjustments, and identify extender glyphs such as Arabic kashidas. Its design is iterative: the layout client tries the least disruptive option and advances through priorities until the line fits.

Conceptually, this is close to what good Arabic justification needs: the font can expose style-specific capabilities while the paragraph formatter decides line breaks and distributes adjustment. In practice, JSTF support has remained sparse. A standard font table helps only when shaping and layout engines actually consume it.

The limited adoption of JSTF is one reason modern proposals should not assume that one font technology will solve the problem immediately. Native browser support should work conservatively with ordinary OpenType fonts while taking advantage of richer data when available.

### Microsoft Uniscribe

Microsoft's Uniscribe API shows that kashida-aware justification was available as an operating-system primitive by the Windows 2000 era. [`ScriptJustify`](https://learn.microsoft.com/en-us/windows/win32/api/usp10/nf-usp10-scriptjustify) adjusts shaped glyph advances toward a requested width using script-specific justification information.

Uniscribe exposes a detailed [`SCRIPT_JUSTIFY`](https://learn.microsoft.com/en-us/windows/win32/api/usp10/ne-usp10-script_justify) classification, including Arabic blank, normal, kashida, alef, ha, ra, ba, bara, and seen opportunities. This is much richer than asking whether a Unicode boundary joins.

The architecture is significant:

1. shape the run;
2. classify justification opportunities;
3. ask a script-aware routine to distribute expansion;
4. return adjusted glyph advances to the application.

Microsoft's documentation notes that applications with sophisticated paragraph-formatting requirements may implement additional policy themselves. Shaping data and opportunity classes are primitives, not a substitute for a formatter.

### DirectWrite

DirectWrite later generalized this model. `IDWriteTextAnalyzer1` exposes APIs to:

- [retrieve justification opportunities](https://learn.microsoft.com/en-us/windows/win32/api/dwrite_1/nf-dwrite_1-idwritetextanalyzer1-getjustificationopportunities);
- [adjust glyph advances](https://learn.microsoft.com/en-us/windows/win32/api/dwrite_1/nf-dwrite_1-idwritetextanalyzer1-justifyglyphadvances);
- [produce a final justified glyph sequence](https://learn.microsoft.com/en-us/windows/win32/api/dwrite_1/nf-dwrite_1-idwritetextanalyzer1-getjustifiedglyphs), including inserted glyphs where required.

The opportunity structure distinguishes expansion and compression priorities, minimum and maximum adjustments, and whether adjustment may be applied at a glyph's leading or trailing edge. This is a useful precedent for browsers: the engine can preserve source characters while producing a different visual glyph sequence for a justified line.

### HarfBuzz

The original `ar-justify` investigation began partly from Arabic justification logic in the [old HarfBuzz source](https://cgit.freedesktop.org/harfbuzz.old/tree/src/harfbuzz-arabic.c#n336) and an [Adobe Chromium copy](https://github.com/adobe/chromium/blob/master/third_party/harfbuzz/src/harfbuzz-arabic.c). That code records a practical priority system for choosing Arabic elongation points.

Modern HarfBuzz exposes a deliberately narrower primitive. When shaping is requested with the appropriate buffer flag, glyphs may receive [`HB_GLYPH_FLAG_SAFE_TO_INSERT_TATWEEL`](https://harfbuzz.github.io/harfbuzz-hb-buffer.html). The flag says an insertion at that boundary should be safe with respect to shaping. It does not say that the boundary is aesthetically preferred or that the line should be expanded there.

That division is healthy:

- the shaper knows whether a change will corrupt glyph formation;
- the font may know which alternates and extenders are available;
- the formatter knows the line deficit, paragraph context, and distribution policy;
- the author or stylesheet may express a preference among strategies.

### OpenOffice and LibreOffice

The [OpenOffice line-layout source](https://github.com/mirror/openoffice/blob/ac58ea25d9ea6e57181d6047264340cdc75de79a/main/sw/source/core/text/porlay.cxx#L1145) is another important historical artifact. It shows Arabic elongation logic embedded in the formatter rather than delegated entirely to a generic shaper.

LibreOffice inherited related behavior and later adopted modern HarfBuzz shaping. Its results have varied by version, font technology, and document format. TypoArabic's software survey found that some combinations produced useful elongation while others fell back to spaces or exposed shaping defects.

The broader lesson is that “uses HarfBuzz” does not mean “has Arabic justification.” Shaping a run and fitting a paragraph are different responsibilities.

## Desktop and publishing software

### Microsoft Word: durable support for more than two decades

Microsoft Word is the clearest rebuttal to the idea that Arabic-specific justification is too exotic for mainstream software.

Word has long exposed multiple Arabic justification strengths. Office 2003-era documentation and file formats used low, medium, and high kashida modes. Those semantics remain visible in current Microsoft APIs:

- the current [`WdParagraphAlignment`](https://learn.microsoft.com/en-us/office/vba/api/word.wdparagraphalignment) enumeration includes `wdAlignParagraphJustifyLow`, `wdAlignParagraphJustifyMed`, and `wdAlignParagraphJustifyHi`;
- the Open XML SDK's [`JustificationValues`](https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.wordprocessing.justificationvalues) includes low-, medium-, and high-kashida values corresponding to paragraph justification stored in `.docx` documents.

This matters because the feature is not merely a transient UI experiment. It is represented in document formats and automation APIs. Documents can carry a durable intent that one paragraph use a different Arabic justification strength from another.

Word's implementation has not always produced exemplary typography in every font. Titus Nemeth's 2019 comparison shows cases where straight extenders are placed at questionable joins. Longevity proves demand and feasibility; it does not remove the need for better font-aware algorithms.

Microsoft Publisher also exposed kashida-oriented controls in its Middle Eastern typography interface, including a balance between whitespace and elongation. That idea closely resembles the old CSS `text-kashida-space` control discussed below.

### Adobe applications

Adobe's Middle Eastern and North African text engines have long offered Arabic-specific composition. InDesign exposes kashida choices such as None, Short, Medium, Long, and Stylistic, alongside paragraph-composer and justification settings. With suitable fonts, Adobe applications can combine whitespace adjustment, justification alternates, and extender strokes.

The [Adobe documentation for Arabic and Hebrew features](https://helpx.adobe.com/indesign/using/arabic-hebrew.html) is useful both as evidence of user demand and as a warning: a control called “kashida” can still produce poor results if the application inserts flat extenders without respecting contextual geometry. Typography depends on the interaction of the formatter, shaper, and font.

### Specialist Qurʾanic and publishing systems

Qurʾanic composition places unusually strict demands on line fitting. Page layout, verse boundaries, marks, pauses, recitation symbols, and established visual traditions all matter. Systems built for this domain have therefore explored richer approaches than general office software.

[DecoType's Mushaf Muscat](https://mushafmuscat.om/) is a particularly important Web demonstration. The project dynamically fits Qurʾanic text into fixed page areas while retaining interactive Unicode text. TypoArabic's [software-implementation survey](https://research.reading.ac.uk/typoarabic/on-arabic-justification-part-2-software-implementations/) describes a combination of actual kashīda, alternate forms, swashes, whitespace adjustment, and margins as a last resort.

Mushaf Muscat is specialized and controls its font and layout environment. That specialization is not a reason to dismiss it. It proves that selectable, searchable, dynamic Arabic typesetting in a browser is technically possible when the font and formatter are designed together.

### DigitalKhatt

[DigitalKhatt](https://digitalkhatt.org/) approaches justification through parametric Arabic letterforms and an extended shaping/layout system. Rather than representing every extra unit of width as another identical bar, it can change the geometry of glyphs and connected forms.

Its work is important for standards discussions because it demonstrates that a future browser API should describe **layout intent**, not prescribe “insert N copies of U+0640.” In a capable font, widening a run may be realized through coordinated variation of several glyphs.

## Research and experimental systems

Arabic justification has a substantial technical literature. A few especially relevant examples are:

- Mohamed Elyaakoubi and Azzeddine Lazrek's [“Justify Just or Just Justify”](https://quod.lib.umich.edu/j/jep/3336451.0013.105/--justify-just-or-just-justify?rgn=main;view=fulltext), which integrates allographic variants and stretched forms into optimum-fit paragraph breaking rather than treating each line independently;
- Mohamed Jamal Eddine Benatia, Mohamed Elyaakoubi, and Azzeddine Lazrek's work on Arabic text justification in TeX-oriented publishing;
- Aqil M. Azmi and Abeer Alsaiari's [“An Algorithm to Justify Arabic Text”](http://ecsjournal.org/Archive/Volume37/Issue5/6.pdf), which combines alternate-width ligatures with prioritized kashida application;
- Andreas Hallberg's [stretchable-kashida LaTeX experiment](https://github.com/andreasmhallberg/kashida-justification);
- [raqim-kashida](https://github.com/aliftype/raqim-kashida), which focuses on finding prioritized insertion opportunities while leaving shaping and fitting to another layer;
- the Rust [`kashida` crate](https://crates.io/crates/kashida), one of several attempts to package Arabic elongation logic for reuse.

These projects differ in goals and typographic sophistication, but collectively they show that the problem has an active engineering tradition. Browser engines do not need to invent every concept from first principles.

## The Web: early support, standardization, and retreat

### Internet Explorer 5.5

Around 2000, Internet Explorer 5.5 exposed Arabic-specific justification through:

```css
p {
  text-align: justify;
  text-justify: kashida;
  text-kashida-space: 75%;
}
```

`text-justify: kashida` requested elongation-based fitting. `text-kashida-space` controlled how much of the expansion should be supplied by kashida rather than whitespace. Microsoft published an illustrated article, “Justifying Text Using Cascading Style Sheets,” whose archived versions can be found through the [Internet Archive](https://web.archive.org/web/*/http://www.microsoft.com/middleeast/msdn/JustifyingText-CSS*).

This was significant for several reasons:

- it was built into a general-purpose browser rather than a publishing plug-in;
- it was selected declaratively in CSS;
- it separated paragraph alignment from justification method;
- it allowed authors to tune the balance between elongation and spaces;
- it treated Arabic as requiring more than the Latin default.

The implementation had limits, and its exact output depended on the fonts and shaping stack available on Windows. Still, it established that a browser could expose the feature with a very small author-facing API.

A [long-running Stack Overflow question](https://stackoverflow.com/questions/17011065/how-to-get-the-text-justifykashida-css-property-effect-on-to-the-arabic-text) later captured the frustrating afterlife of the feature: authors could find old IE-era examples but not reproduce them interoperably in modern browsers.

### CSS3 Text Working Drafts and the 2003 Candidate Recommendation

The early CSS Text work did not treat Microsoft's feature as merely proprietary. The [2002 CSS3 Text Working Draft](https://www.w3.org/TR/2002/WD-css3-text-20020515/) and the [14 May 2003 Candidate Recommendation](https://www.w3.org/TR/2003/CR-css3-text-20030514/) included explicit Arabic controls.

The Candidate Recommendation defined `kashida` as a `text-justify` value and specified `text-kashida-space` as a percentage controlling the relationship between kashida expansion and whitespace expansion. It therefore addressed two separate author needs:

1. choose elongation as a justification method;
2. choose how strongly it should be preferred over expanded spaces.

The design was not perfect. A single percentage says little about font capabilities, language, stylistic tradition, maximum acceptable elongation, or whether alternate forms should precede straight extenders. But the CSS work correctly recognized that Arabic justification deserved an explicit control rather than being left entirely to an opaque `auto` heuristic.

### Why those properties disappeared

The 2003 CSS3 Text Candidate Recommendation did not advance to Recommendation in that form. CSS Text was substantially rewritten, split, and narrowed. Features without interoperable implementations or sufficiently mature definitions were removed or deferred. `text-justify: kashida` and `text-kashida-space` disappeared from the standards-track syntax.

Microsoft continued to document related `-ms-` behavior for its legacy engine, and compatibility modes complicated the exact support story. But the feature never became cross-browser. It was ultimately stranded in the Trident/legacy Microsoft browser line and did not survive into today's Chromium-based Microsoft Edge.

So “Internet Explorer had it and then it was removed” is broadly correct, with one nuance: the retreat happened across both implementation and standardization. Some syntax survived for a time in legacy modes and prefixed documentation, while the standards proposal itself was also abandoned. What disappeared was not merely one browser toggle; it was the expectation that kashida would become an interoperable CSS feature.

### Current CSS Text

Current [CSS Text Level 3](https://www.w3.org/TR/css-text-3/) and the evolving [CSS Text Level 4](https://drafts.csswg.org/css-text-4/) retain `text-justify`, but no longer define a `kashida` value or `text-kashida-space` property.

`text-justify: auto` allows a user agent to choose a justification algorithm appropriate to the text's language and writing system. This leaves room for Arabic elongation. It does not give authors a dependable contract that elongation will be used, a way to prefer it over word spacing, or a way to select a controlled blend.

That distinction matters:

- **permission**: the browser may use a good Arabic method;
- **interoperability**: authors can depend on the same broad behavior across engines;
- **control**: authors can request an Arabic method when it matters to the publication.

Current CSS offers the first much more readily than the second or third.

The [W3C Arabic and Persian Layout Requirements](https://www.w3.org/TR/alreq/) document explains the script's needs and records justification as an area where simplistic spacing is inadequate. Its [GitHub issue tracker](https://github.com/w3c/alreq/issues?q=is%3Aissue+kashida) and the [CSS Working Group issue search](https://github.com/w3c/csswg-drafts/issues?q=is%3Aissue+kashida) are useful places to follow and contribute to ongoing discussion.

### The modern browser gap

Modern engines have powerful shapers and can render complex Arabic correctly in ordinary runs. Yet many real pages still show justification dominated by oversized word spaces. This is not a contradiction. The responsibilities are separate:

- the bidi algorithm orders runs;
- the line breaker chooses break positions;
- the shaper maps characters to glyphs;
- the justification algorithm chooses where and how much to adjust;
- the font provides glyphs and optional alternates;
- painting, selection, hit testing, and copying expose the result to the user.

HarfBuzz can shape Arabic and can flag a boundary as safe for tatweel insertion, but it does not decide the paragraph's visual rhythm. A browser still needs a formatter that asks the shaper the right questions and distributes the deficit well.

## Why native Web support is difficult

The difficulty is real, but it is containable. Several distinct problems are often conflated.

### 1. Choosing opportunities

The formatter must respect:

- actual joining behavior rather than code-point range alone;
- grapheme clusters and combining marks;
- ZWJ and ZWNJ;
- lam–alef and other ligature behavior;
- authored tatweels;
- word position and letterform context;
- language and writing style;
- font-specific shaping safety.

A simple “insert after any dual-joining letter” rule is structurally and aesthetically insufficient.

### 2. Ranking opportunities

Several places in one word may be safe, but one may be strongly preferred. Historical and software systems use priority tables based on letter and contextual form. Modern fonts may expose better choices through alternates, JSTF, or shaping metadata.

The ranking should also consider distribution. Six extensions at one boundary can be worse than one extension in each of several words even when the first boundary has the highest local priority.

### 3. Determining the amount

A tatweel does not have one universal additive width. Its advance depends on the font, neighboring glyphs, substitutions, positioning, and the number of extensions already present. The robust approach is to shape and measure the whole changed run, not multiply a standalone tatweel width by a count.

Variable fonts and parametric systems make this even clearer: additional width may be a continuous geometric change rather than a discrete character count.

### 4. Paragraph-wide line breaking

A line-by-line polyfill can improve visible spacing, but professional justification often considers the paragraph globally. A different earlier break can prevent an extreme adjustment later. Research such as “Justify Just or Just Justify” combines Arabic-specific expansion with optimum-fit paragraph breaking.

A browser-native implementation is in a better position than JavaScript to integrate line breaking, shaping, and justification in one loop.

### 5. Fonts

Some fonts provide only a basic tatweel glyph. Others contain contextual alternates, elongated forms, swashes, ligatures, or justification data. A browser must degrade gracefully:

- use richer font mechanisms when trustworthy;
- fall back to conservative cursive extension where safe;
- retain modest word-space adjustment for the residual deficit;
- avoid fabricating grotesque forms merely to reach the edge.

“Support kashida” cannot mean “guarantee identical output in every font.” CSS already tolerates font-dependent shaping and metrics; Arabic justification should expose a semantic preference while allowing font-sensitive realization.

### 6. Canonical text, selection, copying, and search

A JavaScript implementation faces an awkward choice:

- insert literal U+0640 into text nodes, producing native selection geometry but altering copied and searchable text;
- render elongations through generated or auxiliary content, preserving canonical text but exposing selection-painting and hit-testing oddities.

A browser does not need to accept that compromise. It already paints glyphs that do not map one-to-one to characters, including ligatures and contextual substitutions. Native justification glyphs can be part of the visual glyph run while source positions remain unchanged.

A complete browser feature should specify or test that:

- `textContent` and DOM ranges remain based on authored text;
- copying omits layout-only elongation;
- Find-in-page matches the authored sequence;
- selection backgrounds visually cover the elongated glyphs;
- the caret does not acquire artificial stops inside a layout-only extender;
- accessibility APIs expose the authored text;
- printing and PDF output retain the fitted appearance.

### 7. Dynamic layout

Web text changes after initial layout. A native formatter must respond to:

- responsive width changes;
- late-loading web fonts;
- variable-font axis changes;
- zoom and device-pixel-ratio changes;
- DOM mutations;
- language and direction changes;
- print layout;
- fragmentation across columns and pages.

JavaScript can observe and recompute some of these states, but the browser's own line-layout pipeline is the natural owner.

### 8. Mixed scripts and writing systems

Arabic paragraphs often include Latin words, numbers, punctuation, Qurʾanic marks, Persian or Urdu letters, and bidirectional isolates. Justification must preserve those runs and distribute expansion only where appropriate.

Moreover, “Arabic script” does not imply “Arabic language” or “Naskh style.” Any proposal should invite input from Persian, Urdu, Kurdish, Uyghur, Jawi, and other communities rather than treating one Arabic typographic tradition as universal.

## Web experiments and polyfills

### Literal tatweel insertion

The simplest polyfill inserts U+0640 into the string until a line reaches its target width. It has several advantages:

- shaping is delegated to the browser;
- the inserted glyph participates in native layout;
- selection paints through it naturally;
- implementation can be small.

Its disadvantages are fundamental when text semantics matter: the DOM, clipboard, search string, caret positions, and downstream text processing all contain layout characters.

This approach can be acceptable for an export pipeline that owns and later strips the transformed representation. It is a poor default for interactive Web documents.

### Generated-content markers

`ar-justify` uses empty, `aria-hidden` marker elements whose generated `::before` content displays the elongation. The authored text remains unchanged, and copied text and `textContent` omit the layout-only tatweels.

That approach exposes a browser limitation of its own: native selection highlighting may leave unpainted gaps over generated elongations. The selection's string is correct, but its visual background can look fragmented. Repairing that appearance in JavaScript requires a selection-painting layer with range-boundary and lifecycle complexity.

This is a useful standards lesson. A native browser implementation should combine the semantic cleanliness of layout-only glyphs with normal selection painting—something an engine can do more naturally than a DOM polyfill.

### Canvas, SVG, and controlled renderers

A controlled renderer can shape with HarfBuzz, position glyphs precisely, and implement font-specific expansion. This is attractive for fixed-layout publishing, image generation, or PDF export. It sacrifices ordinary DOM semantics unless it also maintains a text overlay and careful hit testing.

Such systems prove algorithms and font technologies, but they are not a substitute for native text layout on arbitrary Web pages.

### The original investigation behind `ar-justify`

The project's 2025 research thread assembled several practical sources:

- a [Stack Overflow discussion](https://stackoverflow.com/questions/17011065/how-to-get-the-text-justifykashida-css-property-effect-on-to-the-arabic-text) about the vanished CSS behavior;
- the [old HarfBuzz priority logic](https://cgit.freedesktop.org/harfbuzz.old/tree/src/harfbuzz-arabic.c#n336) and its [Chromium copy](https://github.com/adobe/chromium/blob/master/third_party/harfbuzz/src/harfbuzz-arabic.c);
- an early [Persian Computing discussion](https://groups.google.com/g/persian-computing/c/s-ftgmBvlF0/m/mhB2V9ELwwYJ);
- the [OpenOffice implementation](https://github.com/mirror/openoffice/blob/ac58ea25d9ea6e57181d6047264340cdc75de79a/main/sw/source/core/text/porlay.cxx#L1145);
- Elyaakoubi and Lazrek's [paragraph-fitting research](https://quod.lib.umich.edu/j/jep/3336451.0013.105/--justify-just-or-just-justify?rgn=main;view=fulltext);
- TypoArabic's [historical](https://research.reading.ac.uk/typoarabic/on-arabic-justification-part-1/) and [software](https://research.reading.ac.uk/typoarabic/on-arabic-justification-part-2-software-implementations/) surveys;
- later experimental packages such as the [`kashida` crate](https://crates.io/crates/kashida).

The implementation that emerged is intentionally modest: Unicode-aware joining analysis, a small priority system, browser measurement, conservative fitting, source-preserving display markers, and an optional adaptive poetry layout. It is evidence that better output is possible today, not a claim to replace native shaping and paragraph layout.

## A compact chronology

| Period | Event | Why it matters |
| --- | --- | --- |
| Manuscript era | Scribes vary letterforms, connections, spacing, configurations, and margins | Arabic justification begins as a rich calligraphic practice, not a repeated-bar algorithm. |
| Early 1500s | Straight extender sorts appear in early European Arabic printing | Mechanical convenience starts narrowing the available repertoire. |
| 1911 | Arabic Linotype enters the mechanized composition lineage described by Nemeth | Industrial systems formalize context-sensitive Arabic type composition. |
| 1939 | Arabic Monotype systems follow | Mechanical Arabic composition becomes more systematic. |
| 1960s | Linotype & Machinery and Compugraphic develop Arabic JusTape | Justification opportunities become automated substitution rules. |
| 1968 | Al-Ahram reportedly deploys JusTape-based production | Automated kashida justification is used at newspaper scale. |
| 1990s | Unicode, OpenType, and modern shaping stacks mature | Stable character encoding is separated from contextual glyph formation. |
| 2000 | Windows 2000-era Uniscribe exposes `ScriptJustify` | Arabic-specific opportunity classes become a platform API. |
| 2000 | Internet Explorer 5.5 exposes `text-justify: kashida` | A general-purpose browser gains declarative Arabic justification. |
| 2002 | CSS3 Text Working Draft specifies kashida controls | The idea moves from one browser into the standards process. |
| 2003 | CSS3 Text Candidate Recommendation includes `kashida` and `text-kashida-space` | CSS briefly has both strategy and blend controls. |
| 2003 | Word-era formats and UI expose low, medium, and high kashida modes | Mainstream document software stores Arabic justification intent. |
| Later 2000s | CSS Text is rewritten and the explicit kashida properties disappear | The Web standard retreats before interoperability is achieved. |
| 2007 onward | Office Open XML standardizes low-, medium-, and high-kashida paragraph values | The desktop document model remains durable even as CSS loses its controls. |
| 2010s | DirectWrite, research systems, and specialist formatters deepen the available primitives | Safe opportunities, alternate glyphs, and paragraph-wide fitting are increasingly understood. |
| 2017 | Mushaf Muscat demonstrates dynamic Qurʾanic layout in the browser | High-quality selectable Web Arabic is shown to be possible in a controlled system. |
| 2019 | TypoArabic surveys major software implementations | The gap between feature labels and typographic quality is documented. |
| 2020s | HarfBuzz exposes safe-to-insert-tatweel metadata; DigitalKhatt advances parametric shaping | Browser engines gain better building blocks, though not yet an author-facing CSS feature. |
| 2025–2026 | `ar-justify` is prototyped and packaged | A small DOM experiment demonstrates demand, algorithms, and semantic trade-offs. |

## What native CSS support should mean

A useful Web feature should not freeze one historical algorithm into CSS. It should define an author-facing preference, required semantics, and fallback behavior while leaving room for fonts and engines to improve.

### Minimum author capability

The smallest useful control would let an author say:

> Prefer cursive elongation for this justified Arabic text; use space expansion only as a fallback or residual mechanism.

Historically this was expressed as:

```css
text-justify: kashida;
```

Reviving that exact token is one option, but the important point is the semantic contract, not nostalgia for the old grammar. Alternatives could allow an ordered strategy or an explicit preference layered on `text-justify: auto`.

A first proposal should avoid an elaborate set of knobs. One dependable preference is more valuable than several underspecified strengths.

### A secondary blend control

The old `text-kashida-space` property recognized a real need: typography often benefits from a blend of elongation and moderate whitespace adjustment. A modern design might eventually expose a balance or maximum, but only after the basic strategy is interoperable.

Any blend control should avoid implying that “75%” has an obvious geometric meaning across fonts. Possible models include:

- a preference strength rather than a literal ratio;
- a maximum permitted inter-word expansion before elongation is required;
- a maximum elongation per opportunity or word;
- an ordered list of strategies;
- named quality presets whose exact realization remains font-sensitive.

These require experimentation. They should not block the first step.

### Required semantics

The specification and Web Platform Tests should require that layout-only elongation:

- does not mutate DOM text;
- is omitted from copied plain text;
- does not alter Find-in-page matching;
- does not add caret positions;
- is omitted from accessibility text;
- participates visually in selection highlighting;
- is represented correctly in printing and PDF output;
- is recomputed after font and layout changes;
- respects `lang`, directionality, grapheme clusters, and join controls.

These semantics are as important as the appearance. A browser feature that merely inserts U+0640 into text nodes would not be an acceptable implementation.

### Font- and shaper-aware realization

The specification should allow a range of implementations:

1. use JSTF or justification alternates when the font provides reliable data;
2. use variable-font or parametric expansion where available;
3. use shaping-engine safety metadata for fallback extenders;
4. distribute opportunities with script- and language-sensitive priorities;
5. retain modest inter-word adjustment for residual width;
6. fall back gracefully when the active font cannot support elongation well.

CSS should state the author's preference and observable behavior. It should not require every browser to insert the same number of U+0640 glyphs at the same code-point offsets.

### Language and style scope

A proposal must not define “Arabic” as one language-font pair. It should be reviewed against Arabic, Persian, Urdu, Kurdish, Uyghur, Jawi, and other Arabic-script use. It should also distinguish writing styles: a strategy suitable for Naskh may be inappropriate for Nastaliq or Ruqʿah.

The `lang` attribute and font's script/language systems can guide the engine. Authors may still need the ability to decline elongation in a particular design.

## How to advocate for native browser support

The historical record suggests that a successful proposal needs more than a property name. It needs evidence, a small interoperable target, and tests that connect typography to Web semantics.

### 1. Write a focused use-case and requirements document

Start with concrete publishing scenarios:

- long-form Arabic reading pages;
- Qurʾanic and classical-text editions;
- newspapers and magazines;
- educational material;
- dictionaries and reference works;
- government and legal publishing;
- Arabic poetry, including paired hemistichs.

Show the same paragraphs under space-only justification and competent elongation. Explain why the former harms texture and reading rhythm rather than merely saying it looks unattractive.

The requirements document should distinguish:

- baseline functionality suitable for ordinary fonts;
- advanced functionality enabled by rich fonts;
- author control;
- font/shaper responsibilities;
- selection, copy, search, accessibility, and print semantics.

### 2. Build a public, reusable test corpus

A small open corpus will make browser work much easier. It should include:

- unvocalized Arabic prose;
- fully vocalized classical Arabic;
- Qurʾanic combining marks;
- Persian and Urdu samples;
- ZWJ, ZWNJ, and authored tatweels;
- mixed Arabic, Latin, numbers, and punctuation;
- short and long measures;
- lines with many and few valid opportunities;
- ordinary paragraphs and isolated justified lines;
- poetry as a separate layout use case.

Use redistributable fonts such as Amiri, Noto Naskh Arabic, and Scheherazade New, and include reference images reviewed by qualified Arabic typographers. Record the font version, browser version, width, size, language, and expected fallback.

### 3. Separate safety from quality

A tractable browser milestone could begin with:

- shaping-engine-confirmed safe opportunities;
- a conservative priority policy;
- one elongation pass across words;
- residual space expansion;
- no source-text mutation.

That would not reproduce master calligraphy, but it could be substantially better than extreme word spaces. Richer JSTF, `jalt`, and variable-font behavior can follow.

This staged model makes implementation review easier: first ensure that the browser never breaks joining or semantics, then improve typographic ranking.

### 4. File aligned issues in the right venues

The work crosses several communities:

- [W3C Arabic and Persian Layout Requirements](https://github.com/w3c/alreq) for script requirements and terminology;
- [CSS Working Group](https://github.com/w3c/csswg-drafts) for author-facing properties and normative behavior;
- [Web Platform Tests](https://github.com/web-platform-tests/wpt) for interoperable tests;
- Chromium, Gecko, and WebKit issue trackers for implementation prototypes;
- HarfBuzz and font-tool communities for shaping metadata and font support.

Open issues should link to one canonical explainer and test corpus rather than repeating slightly different proposals. Cross-reference the historical CSS3 Text design, but do not ask implementers to restore it verbatim without addressing the last two decades of shaping and semantics work.

### 5. Ask for a preference, not pixel-identical output

Browser vendors will reasonably resist a requirement that every engine and font produce identical elongation geometry. CSS rarely promises that for text shaping.

The proposal should instead define:

- when the author has requested elongation-preferred justification;
- the required fallback order at a high level;
- which text and accessibility semantics must remain invariant;
- that unsafe joining changes are forbidden;
- that extreme inter-word spacing should be avoided when suitable elongation is available.

Reference rendering tests can use tolerances and invariants—no overflow, no broken joins, no altered source—alongside a smaller set of exact tests for property parsing and computed values.

### 6. Produce a browser prototype

A prototype in one engine would clarify the architecture:

1. line breaker computes a deficit;
2. shaping layer returns safe or preferred opportunities;
3. formatter distributes expansion across words;
4. shaper produces the final glyph sequence;
5. selection and hit testing map the extra glyph geometry to adjacent source positions;
6. clipboard and accessibility expose only source characters.

The prototype should compare:

- ordinary OpenType fonts with no JSTF data;
- a font with `jalt` or useful alternates;
- a parametric or variable demonstration font;
- fallback behavior when no safe opportunity exists.

### 7. Turn semantics into Web Platform Tests early

Tests should cover more than screenshots. Useful assertions include:

- `element.textContent` is unchanged;
- copied plain text is unchanged;
- Find-in-page crosses a visually elongated connection;
- selection painting covers the extension;
- DOM range offsets remain source offsets;
- layout recomputes after a web font loads;
- changing container width removes obsolete elongation;
- ZWNJ boundaries are never elongated;
- combining marks remain attached to their base;
- print output matches screen layout within expected pagination differences.

These are exactly the places where a JavaScript polyfill reveals platform limitations.

### 8. Demonstrate sustained demand

The strongest historical argument is continuity:

- Arabic typography has always required line fitting beyond space expansion;
- mechanized systems have automated it since at least the 1960s;
- Word has preserved multiple kashida modes for more than twenty years;
- Internet Explorer and CSS3 Text already exposed a Web-facing model;
- modern specialist systems prove higher-quality approaches;
- authors continue to seek workarounds and publish JavaScript libraries because the native gap remains.

Collecting endorsements and real production examples from publishers, Arabic type designers, educational platforms, Qurʾanic projects, and accessibility experts will make the feature harder to dismiss as decorative.

### 9. Keep the initial CSS proposal small

A credible first proposal might contain only:

- one elongation-preferred `text-justify` value or companion preference;
- a defined fallback to inter-word expansion;
- language-sensitive behavior;
- source-preserving selection/copy/search semantics;
- explicit non-goals for exact glyph geometry and advanced font controls.

Once two engines can implement and test that core, the group can consider blend controls, maximum expansion, font-feature interaction, and more advanced style selection.

## Open design questions

Several questions deserve experiments rather than confident answers:

1. Should the author preference be a new `text-justify` value, a companion property, or an ordered strategy list?
2. Should `auto` be strengthened for Arabic even without a new author control?
3. How should a browser choose between JSTF, `jalt`, variable-font axes, and fallback extenders?
4. What is the best cross-font limit on elongation: glyph count, physical width, em units, or font-provided constraints?
5. Should the browser expose named strength levels similar to Word, or leave strength entirely to the font and UA?
6. How should `text-align-last` interact with isolated Arabic lines and poetry?
7. How should elongation work across inline element boundaries without changing shaping?
8. What selection geometry should a layout-only extender map to when the user drags through it?
9. How should browser devtools expose layout-only justification glyphs?
10. Can paragraph-wide optimum breaking be introduced incrementally without making ordinary layout prohibitively expensive?

These questions are reasons to prototype, not reasons to leave the feature undefined indefinitely.

## Lessons from the history

### The problem is old; the Web gap is not evidence of impossibility

Arabic line fitting predates software by centuries. Automated systems existed decades before the Web. Word, Windows, Adobe, and specialist publishers have maintained relevant primitives and controls. The missing CSS feature is a standards and implementation gap, not an unsolved mathematical problem.

### A straight tatweel is a fallback mechanism, not the definition

Mechanical systems made the straight extender dominant because it was convenient. Digital systems can do better by combining alternates, shape variation, safe connection elongation, and moderate spacing.

### Shaping and justification must cooperate

A shaper alone does not know the paragraph's target width or desired rhythm. A formatter alone should not guess which glyph changes are safe. Good architecture passes information between them.

### Author control and typographic quality are separate questions

Internet Explorer's property was valuable even if its rendering was imperfect. Authors need a way to express intent; engines and fonts need to improve realization. Rejecting author control because one historical algorithm was crude confuses the API with the implementation.

### Text semantics must be designed, not patched later

A Web solution must preserve copying, searching, accessibility, selection, and responsiveness. Polyfills expose these constraints vividly. Native layout has the advantage of creating extra glyph geometry without inventing source characters.

### The first interoperable step can be conservative

A useful browser implementation does not need to reproduce every calligraphic tradition. Safe, restrained elongation with residual word spacing would already be a major improvement. The path to sophistication can remain open through font data and later CSS controls.

## Selected sources and further reading

### Historical and typographic studies

- Titus Nemeth, [“On Arabic justification, part 1”](https://research.reading.ac.uk/typoarabic/on-arabic-justification-part-1/).
- Titus Nemeth, [“On Arabic justification, part 2 – software implementations”](https://research.reading.ac.uk/typoarabic/on-arabic-justification-part-2-software-implementations/).
- Mohamed Elyaakoubi and Azzeddine Lazrek, [“Justify Just or Just Justify”](https://quod.lib.umich.edu/j/jep/3336451.0013.105/--justify-just-or-just-justify?rgn=main;view=fulltext).
- Aqil M. Azmi and Abeer Alsaiari, [“An Algorithm to Justify Arabic Text”](http://ecsjournal.org/Archive/Volume37/Issue5/6.pdf).
- [Persian Computing discussion on kashida](https://groups.google.com/g/persian-computing/c/s-ftgmBvlF0/m/mhB2V9ELwwYJ).

### Web standards and requirements

- [CSS3 Text Candidate Recommendation, 14 May 2003](https://www.w3.org/TR/2003/CR-css3-text-20030514/).
- [CSS Text Level 3](https://www.w3.org/TR/css-text-3/).
- [CSS Text Level 4 editor's draft](https://drafts.csswg.org/css-text-4/).
- [Arabic and Persian Layout Requirements](https://www.w3.org/TR/alreq/).
- [CSSWG issues mentioning kashida](https://github.com/w3c/csswg-drafts/issues?q=is%3Aissue+kashida).
- [ALReq issues mentioning kashida](https://github.com/w3c/alreq/issues?q=is%3Aissue+kashida).
- [Archived Microsoft “Justifying Text Using Cascading Style Sheets” pages](https://web.archive.org/web/*/http://www.microsoft.com/middleeast/msdn/JustifyingText-CSS*).
- [Stack Overflow: reproducing `text-justify: kashida`](https://stackoverflow.com/questions/17011065/how-to-get-the-text-justifykashida-css-property-effect-on-to-the-arabic-text).

### Character, font, and shaping specifications

- Unicode Character Database, [`ArabicShaping.txt`](https://www.unicode.org/Public/UCD/latest/ucd/ArabicShaping.txt).
- OpenType [`JSTF` table](https://learn.microsoft.com/en-us/typography/opentype/spec/jstf).
- OpenType [`jalt` feature](https://learn.microsoft.com/en-us/typography/opentype/spec/features_ja#jalt).
- HarfBuzz [`HB_GLYPH_FLAG_SAFE_TO_INSERT_TATWEEL`](https://harfbuzz.github.io/harfbuzz-hb-buffer.html).

### Microsoft platform and document APIs

- Uniscribe [`ScriptJustify`](https://learn.microsoft.com/en-us/windows/win32/api/usp10/nf-usp10-scriptjustify).
- Uniscribe [`SCRIPT_JUSTIFY`](https://learn.microsoft.com/en-us/windows/win32/api/usp10/ne-usp10-script_justify).
- DirectWrite [`GetJustificationOpportunities`](https://learn.microsoft.com/en-us/windows/win32/api/dwrite_1/nf-dwrite_1-idwritetextanalyzer1-getjustificationopportunities).
- DirectWrite [`JustifyGlyphAdvances`](https://learn.microsoft.com/en-us/windows/win32/api/dwrite_1/nf-dwrite_1-idwritetextanalyzer1-justifyglyphadvances).
- DirectWrite [`GetJustifiedGlyphs`](https://learn.microsoft.com/en-us/windows/win32/api/dwrite_1/nf-dwrite_1-idwritetextanalyzer1-getjustifiedglyphs).
- Word VBA [`WdParagraphAlignment`](https://learn.microsoft.com/en-us/office/vba/api/word.wdparagraphalignment).
- Open XML SDK [`JustificationValues`](https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.wordprocessing.justificationvalues).

### Implementations and experiments

- [Old HarfBuzz Arabic justification source](https://cgit.freedesktop.org/harfbuzz.old/tree/src/harfbuzz-arabic.c#n336).
- [Adobe Chromium copy of the old HarfBuzz Arabic source](https://github.com/adobe/chromium/blob/master/third_party/harfbuzz/src/harfbuzz-arabic.c).
- [OpenOffice Arabic line-layout source](https://github.com/mirror/openoffice/blob/ac58ea25d9ea6e57181d6047264340cdc75de79a/main/sw/source/core/text/porlay.cxx#L1145).
- [Mushaf Muscat](https://mushafmuscat.om/).
- [DigitalKhatt](https://digitalkhatt.org/).
- [raqim-kashida](https://github.com/aliftype/raqim-kashida).
- [Stretchable kashida experiment for LaTeX](https://github.com/andreasmhallberg/kashida-justification).
- [Rust `kashida` crate](https://crates.io/crates/kashida).

## Closing perspective

Arabic justification has repeatedly reached the same crossroads. A system can widen spaces because that is easy and universal; it can insert straight extenders because that is mechanically convenient; or it can let shaping, font knowledge, and paragraph layout cooperate.

Desktop and specialist systems show that the third path is practical. Early Internet Explorer and CSS3 Text show that a small declarative author control is possible. Modern Unicode, OpenType, HarfBuzz, and browser text stacks provide better foundations than those early implementations had.

What is missing is not another proof that Arabic can be justified. It is a focused interoperability effort: a modest CSS preference, source-preserving semantics, script-reviewed tests, and implementation work shared by browser, shaping, and type-design communities.