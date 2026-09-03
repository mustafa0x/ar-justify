# A history of Arabic text justification, especially on the Web

> Last reviewed: September 2026

Arabic justification has a peculiar software history. It is an old and central part of Arabic typography; mature desktop software has supported it for decades; Internet Explorer implemented a browser-native form around the beginning of the century; early CSS specifications described explicit kashida controls; and yet mainstream Web engines today generally justify Arabic by widening word spaces.

This document traces how that happened. It also explains why “insert U+0640 until the line is full” is not an adequate description of Arabic justification, surveys important software and research projects, records the sources that led to `ar-justify`, and proposes a practical route toward native browser support.

This is a historical and technical overview, not a normative specification. Software behavior changes, and historical claims about implementation quality should be read in the context of the cited version and date.

## The short version

Arabic lines can be fitted by combining several techniques:

- varying spaces between words;
- elongating suitable connections or parts of letterforms;
- using wider, narrower, swash, stacked, or ligated forms;
- making small font-specific positioning adjustments;
- changing line breaks or, in exceptional traditional settings, the configuration of words and margins.

The word **kashida** is often used loosely for all Arabic elongation. It is useful to distinguish calligraphic or font-driven **kashīda**—a context-sensitive change in the letterform—from the literal Unicode character **U+0640 ARABIC TATWEEL** (`ـ`), a straight join-causing extender. The two may look similar in simple fonts, but they are not the same typographic mechanism.

The Web once had explicit syntax for this problem. Internet Explorer 5.5 supported `text-justify: kashida`, and the 2003 CSS3 Text Candidate Recommendation defined both `text-justify: kashida` and `text-kashida-space`, a percentage controlling how much line expansion should come from kashida rather than whitespace. Those controls later disappeared from standards-mode Internet Explorer and from CSS Text. Current CSS says that `text-justify: auto` may use cursive elongation for Arabic, but it does not give authors an explicit switch or define a complete Arabic algorithm. Mainstream browsers therefore remain free to—and generally do—fall back to inter-word spacing.

The result is not that Arabic justification is unsolved. Microsoft Word, Uniscribe, Adobe applications, OpenOffice and LibreOffice, DecoType’s Mushaf Muscat, DigitalKhatt, TeX experiments, and multiple research systems have all implemented parts of it. The unresolved problem is interoperable, high-quality, semantics-preserving justification in general-purpose Web engines and fonts.

## Terminology: justification, kashida, and tatweel

### Justification is a line-fitting system

Full justification makes each line occupy a target measure. In Latin typography, this is commonly achieved by changing word spaces, sometimes with hyphenation, glyph expansion, or paragraph-wide line breaking. Arabic typography offers more possibilities because the script is cursive and many styles permit controlled changes to connected letterforms.

Calling the whole process “kashida insertion” hides much of the problem. A good formatter must decide:

1. where a line may expand or contract;
2. which opportunities are preferable;
3. how the available adjustment should be distributed;
4. which font mechanisms can realize the adjustment;
5. whether a different line break would produce a better paragraph;
6. how the result should respond to width, font, size, language, and content changes.

### Kashīda is broader than U+0640

Titus Nemeth’s [historical account of Arabic justification](https://research.reading.ac.uk/typoarabic/on-arabic-justification-part-1/) adopts a useful distinction associated with Thomas Milo and DecoType:

- **kashīda**: elongation of letterforms according to the conventions and shapes of a particular writing style, commonly through curvilinear extension and contextual reconfiguration;
- **taṭwīl / tatweel**: the encoded character U+0640, generally rendered as a straight baseline extender.

Unicode describes U+0640 as **Join_Causing**, like U+200D ZERO WIDTH JOINER: it participates in joining but does not itself take contextual letter forms. The current Unicode names list says it may be inserted to stretch characters or carry tashkil without a base letter. That makes it a useful character, but not a complete layout model.

A layout engine can produce elongation without placing U+0640 in the source string. Conversely, a document can contain an intentional U+0640 that is part of its authored text rather than a transient justification decision. Software must distinguish those cases.

### Arabic styles do not share one universal rule

Elongation depends on language, script style, font, word shape, position, and calligraphic convention. A Naskh strategy cannot simply be imposed on Nastaliq, Ruqʿah, Persian, Urdu, Kurdish, or Qurʾanic text. Some styles permit extensive curvilinear elongation; some rely more heavily on alternative forms or stacking; some traditionally avoid elongation in contexts where it harms recognition.

This is why a structurally valid joining boundary is only a **possible** opportunity. It is not necessarily a good typographic opportunity.

## Before software: manuscript practice and mechanical simplification

### Manuscript and early typographic practice

Arabic scribes and calligraphers did not normally solve every short line by inserting identical horizontal bars. They could vary letterforms, connections, swashes, ligatures, word configurations, spacing, and margins. The available choices depended on the writing style and the hierarchy of the page.

Nemeth groups historical line-fitting techniques into three broad families:

1. variation of letterforms, including elongation and alternative forms;
2. variation of the density of black and white, including spaces;
3. variation of word configuration and page relationships, including stacking, scale, and margins.

Straight extender sorts nevertheless appeared early in European Arabic printing—by at least 1516 in the examples discussed by Nemeth. They were convenient pieces of reusable type. Convenience gradually became convention: a mechanical expedient was easier to automate than the richer repertoire of a calligrapher.

### Hot metal, typewriters, and the codification of tatweel

The twentieth century reinforced the straight extender. Nemeth traces it through:

- the first Arabic Linotype in 1911;
- the first Monotype system for Arabic composition in 1939;
- typewriters and photocomposition;
- computer-assisted newspaper typesetting.

In the second half of the 1960s, Linotype & Machinery and Compugraphic developed the **Arabic JusTape** automated justification system. Substitution tables determined where extenders could be introduced. Al-Ahram appears to have put the system into production in November 1968. It was an important achievement, but one optimized for mechanical composition and newspaper production: tatweel was the principal expansion mechanism, while richer changes to spaces and letterforms were largely excluded.

This history matters because later software did not begin from a blank slate. It inherited fonts, terminology, keyboard habits, and algorithms shaped by earlier machinery. Nemeth cautiously suggests that a line may run from Compugraphic’s Arabic work to Microsoft’s early digital Arabic systems, although he labels that connection conjectural.

## Digital foundations

### Unicode: stable text, contextual shaping

Unicode encodes characters, not final glyph shapes. Arabic letters are stored in logical order and shaped according to context. The Unicode `Joining_Type` property classifies characters as right-joining, dual-joining, join-causing, non-joining, transparent, and so on. U+0640 TATWEEL is join-causing; U+200C ZERO WIDTH NON-JOINER breaks joining; combining marks must remain associated with their base character.

This model is indispensable for interchange, search, editing, and accessibility. It also exposes the central tension in tatweel-based layout:

- If an application inserts literal U+0640 characters into the document to fit a particular width, those layout decisions become part of the text. Copying may include them, exact search may behave differently, cursor movement gains extra positions, and a later resize can make the inserted lengths wrong.
- If an application creates elongation only in rendering, the source remains canonical, but the platform must still define how selection, copying, hit-testing, search highlighting, and accessibility relate to those visual extensions.

High-quality native support should therefore treat justification as transient layout, even when the chosen font mechanism happens to use an extender glyph.

### OpenType: the font can contribute more than a tatweel glyph

OpenType provides several mechanisms relevant to justification:

- contextual substitutions and positioning through GSUB and GPOS;
- the `jalt` **Justification Alternates** feature;
- variable-font axes and feature variations;
- the **JSTF** justification table.

The [OpenType JSTF specification](https://learn.microsoft.com/en-us/typography/opentype/spec/jstf) lets a font describe prioritized suggestions for shrinking or extending text. It can enable or disable substitutions and positioning lookups, provide maximum adjustments, and list extender glyphs such as Arabic kashidas. Its model is iterative: the client tries the least disruptive suggestion first and advances through priorities until the line fits.

JSTF is conceptually close to what sophisticated Arabic justification needs: font-specific, script-specific, language-specific, and priority-aware. Historically, however, support in layout engines has been sparse. A standard font table is only useful when shaping and layout clients act on it.

### Uniscribe and Microsoft’s shaping stack

Microsoft’s Uniscribe API shows that kashida-aware justification was available as a platform primitive by the Windows 2000 era. [`ScriptJustify`](https://learn.microsoft.com/en-us/windows/win32/api/usp10/nf-usp10-scriptjustify) takes shaped glyph information and a desired width adjustment. Its documented priority is:

1. kashida opportunities;
2. inter-word spacing when no kashida opportunity is available;
3. inter-character spacing when neither of the above is available.

Microsoft’s documentation explicitly says that Word and PowerPoint use this concept. It also warns that sophisticated formatters may need their own algorithms, which is an important qualification: a shaping API can expose safe opportunities without deciding all typographic policy.

### HarfBuzz and OpenOffice

The project’s original research began from old Arabic justification code in HarfBuzz and OpenOffice:

- [old HarfBuzz Arabic source](https://cgit.freedesktop.org/harfbuzz.old/tree/src/harfbuzz-arabic.c#n336);
- [an Adobe Chromium copy of the old HarfBuzz implementation](https://github.com/adobe/chromium/blob/master/third_party/harfbuzz/src/harfbuzz-arabic.c);
- [OpenOffice line-layout code](https://github.com/mirror/openoffice/blob/ac58ea25d9ea6e57181d6047264340cdc75de79a/main/sw/source/core/text/porlay.cxx#L1145).

These are valuable historical artifacts because they show practical priority systems and the flow from shaping information into line layout.

Modern HarfBuzz offers a narrower but useful primitive: `HB_GLYPH_FLAG_SAFE_TO_INSERT_TATWEEL`, produced when the corresponding buffer flag is requested. It identifies places where an inserted tatweel should not corrupt shaping. It deliberately does **not** say that every safe point is typographically desirable. Safety belongs to the shaper; taste and distribution belong to the formatter.

## Desktop and publishing software

### Microsoft Word: more than two decades of exposed controls

Microsoft Word has exposed Arabic-specific justification for many years. Word 2003 help described three paragraph-alignment choices:

- **Justify Low**, described as the normal or slight kashida setting;
- **Justify Medium**, using wider kashidas;
- **Justify High**, using the widest kashidas.

The feature was not only a user-interface detail. The Word 2003 XML schema represented paragraph alignment values as `low-kashida`, `medium-kashida`, and `high-kashida`. The legacy binary DOC format likewise records low, medium, and high compression/justification modes. Current Word VBA documentation still exposes `wdAlignParagraphJustifyLow`, `wdAlignParagraphJustifyMed`, and `wdAlignParagraphJustifyHi`.

It is therefore safe to say that Word has had durable, document-level support for Arabic kashida justification for more than two decades, since at least Office 2003, and that the model remains visible in current APIs and file-format documentation.

Microsoft Publisher 2003 went further in one respect: its documented Kashida tab offered a slider adjusting the ratio of whitespace to kashida. That resembles the author control later proposed in CSS as `text-kashida-space`.

Longevity does not guarantee typographic perfection. In his 2019 software survey, Nemeth found that Word could insert straight extenders at unsuitable joins in some OpenType fonts. Still, Word demonstrates that this is not an exotic feature that desktop users never needed. It has been shipped, saved in documents, and maintained across generations of Office.

### Adobe applications

Adobe applications have long exposed Arabic kashida controls. InDesign documentation and interfaces have included settings such as None, Short, Medium, Long, and Stylistic, along with justification alternates and legacy modes. InDesign can combine selected `jalt` alternates, whitespace variation, and extender strokes when the font supports them.

The practical quality has varied by application, version, font, and selected mode. TypoArabic’s 2019 tests found both promising use of justification alternates and serious cases where flat extenders broke contextual joins. The lesson is not that author controls are undesirable; it is that a control named “kashida” cannot compensate for an algorithm that ignores the font’s actual joining geometry.

### OpenOffice and LibreOffice

OpenOffice carried explicit Arabic elongation logic in its line-layout code, and LibreOffice inherited related behavior while adopting HarfBuzz as its shaping engine. LibreOffice has generally offered fewer user-facing Arabic justification choices than Word. TypoArabic’s 2019 survey found behavior dependent on font technology and format: some OpenType and Graphite cases used tatweel-like expansion, while other fonts fell back to spaces or suffered shaping errors.

The OpenOffice source is historically important because it made practical Arabic elongation logic available for study. It is also a reminder that “the application uses HarfBuzz” does not imply that the application has a high-quality paragraph formatter. Shaping and justification are separate layers.

### Research systems, TeX, and specialist tools

A substantial research literature has explored more complete models:

- Mohamed Elyaakoubi and Azzeddine Lazrek’s [“Justify Just or Just Justify”](https://doi.org/10.3998/3336451.0013.105) integrates allographic variants and font-provided stretched forms into optimum-fit paragraph breaking. It explicitly treats kashida as controlled elongation rather than merely a character to insert.
- Mohamed Jamal Eddine Benatia, Mohamed Elyaakoubi, and Azzeddine Lazrek’s “Arabic text justification” in *TUGboat* discusses typographic rules and TeX-oriented approaches.
- Aqil M. Azmi and Abeer Alsaiari’s [“An Algorithm to Justify Arabic Text”](http://ecsjournal.org/Archive/Volume37/Issue5/6.pdf) describes a two-level scheme using alternate-width ligatures followed by prioritized kashida application.
- Andreas Hallberg’s [stretchable-kashida LaTeX experiment](https://github.com/andreasmhallberg/kashida-justification) explores an extensible connector in TeX.
- More recent libraries such as [raqim-kashida](https://github.com/aliftype/raqim-kashida) separate the problem of finding prioritized insertion points from the problem of font shaping and line fitting.

These projects differ in quality and scope, but collectively show that Arabic justification has an active technical tradition outside mainstream browser layout.

### Mushaf Muscat: a Web-native proof of possibility

[The Mushaf Muscat](https://mushafmuscat.om/), launched in 2017, is one of the most important demonstrations. DecoType built a dynamic Qurʾanic page-layout system that had to fit different amounts of text into fixed page areas while retaining interactive Unicode text.

According to TypoArabic’s software study, its formatter combines actual kashīda, alternate forms, swashes, whitespace adjustment, and margins as a last resort. The displayed text remains selectable, searchable, and copyable. The project is specialized and uses a tightly controlled font and layout environment, but that is precisely why it matters: it proves that high-quality, dynamic, standards-aware Arabic typesetting on the Web is technically possible.

### DigitalKhatt: parametric letterforms rather than repeated bars

[DigitalKhatt](https://digitalkhatt.org/about) approaches the problem through a parametric Metafont-designed Arabic typeface and an extended shaping/layout system. Glyph width and shape can change during justification while preserving curvilinear letter construction. Its examples show both intra-letter expansion and inter-letter kashida, along with dynamic reshaping of whole words.

DigitalKhatt is especially relevant to browser advocacy because it illustrates the limit of character insertion as a universal model. In a capable font, “make this run wider by 8 pixels” may be realized by coordinated changes to several glyphs, not six copies of one horizontal extender.

## The rise and retreat of kashida support on the Web

### Timeline

| Date | Event | Significance |
| --- | --- | --- |
| **2000** | Internet Explorer 5.5 supports `text-justify: kashida` | A general-purpose browser exposes Arabic-specific justification. |
| **2002** | CSS3 Text Working Draft includes `text-justify: kashida` | The behavior enters the public CSS standards track. |
| **2003** | CSS3 Text Candidate Recommendation defines `text-justify: kashida` and `text-kashida-space` | CSS describes both a strategy and an author-controlled kashida/whitespace ratio. |
| **2003** | Microsoft publishes “Justifying Text Using Cascading Style Sheets” | The IE implementation and CSS model are documented for Web authors. |
| **2005–2012** | Successive CSS Text drafts retain explicit kashida concepts | The feature remains in draft standards for roughly a decade. |
| **IE8 era** | `text-kashida-space` is deprecated in standards document modes | It survives only in IE5 Quirks and IE7 Standards compatibility modes. |
| **2013** | CSS Text Level 3 removes `kashida`, `inter-ideograph`, and `inter-cluster` values | Arabic-specific author control disappears from the draft grammar. |
| **2014** | W3C Internationalization issues discuss the missing value and incomplete requirements | The standards groups acknowledge that no complete Arabic equivalent of JLREQ yet exists. |
| **2017** | Mushaf Muscat launches | A specialized Web engine demonstrates high-quality dynamic Arabic page fitting. |
| **2019** | TypoArabic surveys mainstream applications and browsers | The survey finds browser justification consistently limited to whitespace variation. |
| **2020** | W3C Arabic Layout issue #225 opens | The lack of combined cursive justification mechanisms is recorded as a Basic-priority Web gap. |
| **2025** | W3C line/paragraph test issue #94 records failures in Blink, Gecko, and WebKit | The interop test expects swash substitution or kashida baseline extension; all tested engines fail. |
| **2026** | Current CSS Text Levels 3 and 4 still delegate Arabic elongation to `text-justify: auto` | The specifications permit appropriate behavior but expose no explicit kashida strategy or balance control. |

### Internet Explorer 5.5: proprietary implementation before interoperable CSS

Microsoft’s archived Internet Explorer documentation defines `textJustify: kashida` as justification by elongating characters at chosen points, intended for Arabic-script languages, and says the value was supported beginning with Internet Explorer 5.5.

IE also exposed `textKashidaSpace`, a percentage governing the ratio of kashida expansion to whitespace expansion. The design anticipated a genuinely useful author need: some contexts prefer almost all expansion in elongation, while others need a hybrid result.

Microsoft documented the feature for Web developers in the 2003 article [“Justifying Text Using Cascading Style Sheets”](https://web.archive.org/web/20030719183154/http://www.microsoft.com/middleeast/msdn/JustifyingText-CSS.aspx). The property names and value semantics were not merely internal experiments; they were presented as CSS authoring tools.

### The 2002 and 2003 CSS Text drafts

The [May 2002 CSS3 Text Working Draft](https://www.w3.org/TR/2002/WD-css3-text-20020515/) included `kashida` among the values of `text-justify`.

The [May 2003 Candidate Recommendation](https://www.w3.org/TR/2003/CR-css3-text-20030514/) was more explicit. It defined:

```css
.arabic {
  text-align: justify;
  text-justify: kashida;
  text-kashida-space: 75%;
}
```

Its `text-kashida-space` percentage expressed the ratio of kashida expansion to whitespace expansion:

- `0%`: no kashida expansion;
- `100%`: expansion through kashida only;
- intermediate values: a mixture.

The specification wisely allowed the user agent to realize elongation through repeated extender glyphs, a single graphic, or character elongation on either side of a point, depending on font and system capability. In other words, the CSS property was about the visual effect, not strictly about inserting U+0640 into the DOM.

### Deprecation in Internet Explorer standards modes

Microsoft later marked `text-kashida-space` deprecated. Its documentation says it is not supported in IE8 and later **standards document modes**, although it remained available when a page used IE5 Quirks or IE7 Standards compatibility modes.

That is more precise than saying “IE8 removed kashida.” The legacy engine and compatibility modes retained pieces of the feature, while the standards-facing surface retreated. TypoArabic reports that tatweel insertion survived in legacy Edge until Microsoft moved Edge to Chromium, but that point should be understood as a historical secondary-source observation rather than a guarantee about every version and mode.

### Removal from CSS Text in 2013

The October 2013 CSS Text Level 3 Working Draft explicitly lists the removal of `kashida`, `inter-ideograph`, and `inter-cluster` from `text-justify` among its changes from the November 2012 draft.

The same draft retained an example saying that `auto` could use cursive elongation for Arabic and allowed user agents to use optional ligatures, alternate glyphs, or glyph compression. But the explicit author choice was gone.

W3C Internationalization discussions in 2014 show why the problem was difficult to standardize:

- [Issue 330](https://www.w3.org/International/track/issues/330) asked for a clearer explanation of the Tasmeem/kashida example.
- [Issue 331](https://www.w3.org/International/track/issues/331) questioned the absence of an explicit kashida style and its relationship to `inter-word` and `distribute`.
- [Issue 332](https://www.w3.org/International/track/issues/332) observed that there was no complete Arabic layout-requirements description comparable to JLREQ, making interoperable behavior hard for CSS to define.
- [Issue 333](https://www.w3.org/International/track/issues/333) addressed the danger of naïvely applying letter spacing to a cursive script.

Richard Ishida’s discussion of Issue 331 noted divergent expert views and called for wider Arabic expertise and an Arabic Layout Requirements document. The historical record therefore suggests that the explicit value was removed not because Arabic elongation had become unnecessary, but because the standards effort lacked a sufficiently agreed and implementable model.

### Current CSS: permission without a dependable feature

The current [CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/) defines `text-justify` values such as `auto`, `none`, `inter-word`, and `inter-character`. Under `auto`, user agents should use language-appropriate justification where possible, and the specification explicitly gives “using cursive elongation for Arabic” as an example.

CSS also says that justification must not introduce gaps between joined units of cursive scripts. A user agent may translate distributed space into cursive elongation; otherwise it must treat the joined run as having no internal spacing opportunity. The specification correctly notes that elongation may depend on script, typeface, language, word and line position, font capabilities, and calligraphic preference, and may involve swashes, contextual forms, ligatures, U+0640, or other microtypography.

What CSS does **not** currently provide is:

- a requirement that conforming browsers actually perform Arabic elongation;
- an explicit author request equivalent to the old `text-justify: kashida`;
- a balance control equivalent to `text-kashida-space`;
- a standardized priority algorithm;
- a way to select among style-specific or font-provided strategies.

The June 2026 Candidate Recommendation Draft even lists the `text-justify` property as “at-risk,” a W3C process term indicating possible implementation-interoperability difficulty. CSS Text Level 4 repeats the cursive-elongation example but does not restore an explicit kashida control.

### The measured browser gap

W3C’s open [Arabic Layout gap issue #225](https://github.com/w3c/alreq/issues/225) describes good Arabic justification as a combination of word-space adjustment, micro-adjustments at non-joining boundaries, swashes or wider glyphs, curvilinear baseline extension, selective ligation, and other style-dependent choices. It says that Blink, Gecko, and WebKit do no more than stretch inter-word spaces and classifies the gap as Basic priority.

The open [line and paragraph test issue #94](https://github.com/w3c/line_paragraph_tests/issues/94), created in April 2025, expects justified Arabic to use swash substitution or kashida baseline extension. Its recorded test runs failed in Firefox 137, Chrome 134, and Safari 18.4. Those are dated test results, not a permanent claim about every later browser build, but the issue remains a useful interoperable target.

## Why Arabic justification is unusually hard on the Web

### 1. Line breaking and elongation affect each other

The engine must first know which words fall on a line, then decide how to fit that line. But inserted elongation changes widths and can itself alter line breaks. A reliable implementation needs a feedback loop and, ideally, paragraph-wide optimization rather than one irreversible pass.

The Web makes this dynamic. A line can change when:

- the viewport or container resizes;
- a Web font finishes loading;
- a variable-font axis changes;
- the user zooms or changes minimum font size;
- content is edited, translated, expanded, or collapsed;
- inline elements or bidirectional runs change measurement.

Literal tatweels authored for one width cannot remain correct under all of those conditions.

### 2. Unicode joining validity is necessary but insufficient

A formatter must respect grapheme clusters, transparent marks, ZWJ, ZWNJ, right-joining and dual-joining letters, required ligatures, and style-specific joining geometry. It must not place an extender between a base and its diacritic or assume that every character position in a Unicode “word” corresponds to a visual connection.

Even after identifying a valid join, the engine still needs a typographic priority. “Safe to insert” and “good place to elongate” are different questions.

### 3. Width is font-dependent and context-dependent

A tatweel does not have a universal width. Shaping can change the widths and forms of neighboring glyphs, and some fonts realize elongation with special contextual forms rather than a repeated flat glyph. Measuring a standalone `ـ` and multiplying is therefore only an estimate.

A robust layout engine must shape and measure the candidate in context. A high-end engine should let the font provide alternatives or parametric changes.

### 4. Good results combine expansion and compression

Real lines vary. Some need to grow; others would be better if a ligature, stacked form, narrower alternate, or small spacing compression allowed one more word to fit. A system that only adds tatweels cannot solve the paragraph as a whole.

This is one reason JSTF, `jalt`, Mushaf Muscat, DigitalKhatt, and paragraph-breaking research are important: they model justification as a sequence of prioritized alternatives, not one repeated character.

### 5. The DOM is both text and user interface

A browser paragraph is not a print image. Users select it, copy it, search it, translate it, annotate it, expose it to accessibility APIs, and place carets in it.

JavaScript implementations face an uncomfortable tradeoff:

- inserting literal U+0640 gives native painting and cursor behavior, but changes `textContent`, copied text, search boundaries, and offsets;
- generated content or empty marker elements can preserve the source, but selection and find highlighting may show gaps over the visual elongation;
- replacing the visible paragraph with a separate visual projection can preserve a hidden source, but selection geometry and accessibility become difficult to reconcile.

A browser engine could solve this at the shaping/layout layer, where visual expansion need not become a character in the DOM. A library cannot fully emulate that privilege.

### 6. Mixed scripts and inline markup complicate the run

Arabic Web text commonly contains numbers, Latin words, punctuation, links, emphasis, annotations, and Qurʾanic marks. Shaping must remain correct across inline boundaries that do not change relevant formatting, but break where font, direction, isolation, or other properties require it. CSS Text defines expectations for shaping across element boundaries, yet a userland library must reconstruct enough of that behavior from DOM ranges and computed styles.

### 7. Performance matters on readers, not demos

A single line is easy to measure repeatedly. A book page, search result, or infinite-scrolling reader can contain thousands of clusters and many independent elements. Naïve implementations force layout for every character and every candidate. Production systems need batching, caching, visible-page scheduling, and careful refresh ownership.

## The research path that led to `ar-justify`

The original May–July 2025 project discussion began with a compact collection of prior art and quickly converged on the problems that still define the library.

### Initial sources collected in the discussion

- [Stack Overflow: “How to get the text-justify:kashida CSS property effect on Arabic text”](https://stackoverflow.com/questions/17011065/how-to-get-the-text-justifykashida-css-property-effect-on-to-the-arabic-text) — evidence of author demand and the mismatch between IE-era syntax and modern browser behavior.
- [Old HarfBuzz Arabic justification source](https://cgit.freedesktop.org/harfbuzz.old/tree/src/harfbuzz-arabic.c#n336) — a concrete priority-based implementation to study.
- [Persian Computing discussion](https://groups.google.com/g/persian-computing/c/s-ftgmBvlF0/m/mhB2V9ELwwYJ) — historical implementation discussion around Persian/Arabic computing.
- [“Justify Just or Just Justify”](https://doi.org/10.3998/3336451.0013.105) — a research model integrating allographs and paragraph fitting.
- [OpenOffice implementation](https://github.com/mirror/openoffice/blob/ac58ea25d9ea6e57181d6047264340cdc75de79a/main/sw/source/core/text/porlay.cxx#L1145) — accessible application code for line elongation.
- [Adobe Chromium’s vendored old HarfBuzz source](https://github.com/adobe/chromium/blob/master/third_party/harfbuzz/src/harfbuzz-arabic.c) — another surviving copy of early browser/shaper code.
- [Azmi and Alsaiari, “An Algorithm to Justify Arabic Text”](http://ecsjournal.org/Archive/Volume37/Issue5/6.pdf) — prioritized calligraphic placement and alternate-width techniques.
- [TypoArabic: software implementations](https://research.reading.ac.uk/typoarabic/on-arabic-justification-part-2-software-implementations/) — the broad desktop/browser survey and Mushaf Muscat case study.
- [Mushaf Muscat](https://mushafmuscat.om/) — a working high-end Web implementation.
- [Archived Microsoft CSS article](https://web.archive.org/web/20030719183154/http://www.microsoft.com/middleeast/msdn/JustifyingText-CSS.aspx) — direct evidence that browser-facing kashida controls once shipped.
- [The Rust `kashida` crate](https://crates.io/crates/kashida) — a small implementation experiment for candidate insertion.

The discussion also mentioned DigitalKhatt as a related effort and explicitly proposed open-sourcing the algorithm so typographers and researchers could improve it.

### The questions discovered by the prototype

The early prototype asked the right questions before it had the right answers:

1. **How do we recover the browser’s visual lines?** The prototype experimented with rendered ranges and line rectangles.
2. **How wide is the remaining deficit?** It measured lines, spaces, and a nominal tatweel, then estimated a count.
3. **Where is elongation allowed?** It developed a “splitter” to identify isolated, initial, medial, and final forms.
4. **How should opportunities be prioritized?** It began implementing the placement rules found in the research and old source code.
5. **How should visual elongation relate to source text?** The discussion compared pseudo-element rendering with literal text replacement and identified the copy/search/selection tradeoff.
6. **Should it behave like a polyfill or an explicit API?** A global `MutationObserver` was considered, but performance and lifecycle ownership were unresolved.
7. **Can it scale to book pages?** The team recognized that repeated measurement across all page text would need batching or page-at-a-time processing.

Those questions led to the current project principles:

- opt in to explicit elements rather than scanning the document;
- preserve the canonical source string;
- analyze real Unicode joining behavior rather than character position alone;
- measure shaped candidates in the active font;
- keep prose justification and adaptive two-column poetry as small, separate layers;
- provide `refresh()` and `destroy()` rather than hiding lifecycle work in a global observer.

`ar-justify` remains a progressive enhancement and a research vehicle. It demonstrates what userland can do; it should not be mistaken for evidence that userland is the ideal layer for the feature.

## What native browser support should provide

A credible native implementation should satisfy more than “a horizontal stroke appeared.”

### Preserve the text model

Visual elongation should not silently add characters to DOM text, clipboard output, search strings, accessibility names, or selection offsets. Authored U+0640 must remain distinguishable from layout-generated elongation.

### Be language-, style-, and font-aware

The browser should use `lang`, script runs, font capabilities, and shaping results. It should not assume that one Naskh-derived insertion table applies to Persian Nastaliq or to Ruqʿah.

### Combine mechanisms

The engine should be able to combine:

- moderate word-space adjustment;
- font-provided elongation;
- justification alternates and swashes;
- selective ligature formation or decomposition;
- safe micro-positioning or width variation;
- paragraph-wide line-break choices.

Tatweel insertion may be a fallback, not the definition of the feature.

### Delegate geometry to the shaper and preference to the formatter

The shaper knows whether an operation preserves joins and which glyph substitutions are available. The formatter knows the target width, paragraph balance, line position, language, and author preferences. Native support needs an interface between those layers.

### Remain stable under normal Web interaction

The result should reflow after resize and font load; print consistently; preserve search and selection; shape across harmless inline boundaries; and avoid introducing inaccessible visual-only text.

### Be testable

Interoperability requires observable tests for:

- whether elongation occurs under `text-justify: auto`;
- whether source and clipboard text remain unchanged;
- whether selection, find highlighting, and caret movement remain coherent;
- whether required joins and ligatures stay intact;
- how mixed scripts and inline elements behave;
- how the result changes across language tags and font capabilities.

## Possible CSS design directions

The following are design sketches, **not current standards proposals**. They illustrate the decisions a standards discussion would need to make.

### 1. Make `text-justify: auto` meaningfully script-aware

The smallest standards change is no new syntax at all. Browsers could implement the behavior that CSS already permits and that W3C’s Arabic test expects:

```css
.arabic {
  text-align: justify;
  text-justify: auto;
}
```

This is the best first interoperability target. It improves default Arabic typography and avoids freezing premature author controls. Its weakness is predictability: authors cannot request spaces only, elongation preferred, or a particular balance.

### 2. Restore an explicit strategy keyword

A later level could revive the intent of:

```css
text-justify: kashida;
```

The value should mean **script-appropriate cursive elongation**, not literal U+0640 insertion. The user agent could use font alternates, curvilinear changes, extender glyphs, or a combination.

Open questions include fallback behavior, mixed-script lines, style detection, and whether the keyword should be named `kashida`, `cursive`, or something broader.

### 3. Restore a balance control

The old `text-kashida-space` addressed a real need: authors may want a hybrid of elongation and whitespace. A modern design might revive that property or define a more general justification preference, for example:

```css
/* Illustrative only; not valid current CSS. */
text-justify: kashida;
text-kashida-space: 80%;
```

A percentage sounds simple but raises hard questions. Does it describe target width, priority, or a maximum? Does `100%` prohibit all word-space change even when no safe elongation exists? How should compression be represented? Any proposal must define graceful fallback rather than force typographically impossible results.

### 4. Let fonts expose prioritized strategies

CSS may need only a high-level preference if OpenType or shaping APIs provide the detailed choices. JSTF, `jalt`, variable-font axes, and shaper safety flags already supply parts of such a model. The challenge is adoption and consistent plumbing between CSS layout, shaping, and fonts.

A standards effort should avoid encoding one project’s Naskh placement table directly into CSS. CSS should select policy; script and font systems should realize it.

## How to advocate for native CSS and browser support

The most effective campaign is not “bring back this old property exactly as written.” It is a staged effort that gives typographers, standards editors, font engineers, browser implementers, and users a shared set of requirements and tests.

### 1. Start with the existing W3C gap

Contribute concrete evidence to [w3c/alreq issue #225](https://github.com/w3c/alreq/issues/225):

- representative Arabic and Persian samples;
- examples from books, newspapers, Qurʾanic pages, and poetry;
- explanations of why space-only output is unacceptable;
- distinctions among Naskh, Nastaliq, Ruqʿah, and other styles;
- references to established desktop behavior and specialist systems.

This keeps the work connected to the Arabic Layout Requirements effort rather than starting an isolated property discussion.

### 2. Build a public test corpus

A useful corpus should include:

- unvocalized and fully vocalized Arabic;
- Qurʾanic combining marks and verse signs;
- Persian and Urdu examples;
- mixed Arabic/Latin/numeric lines;
- words with few or no elongation opportunities;
- required ligatures and contextual forms;
- inline links, emphasis, spans, and bidi isolates;
- narrow and wide measures;
- single-line headings and paired poetry;
- fonts using simple tatweel glyphs, `jalt`, variable widths, or specialized shaping.

Each sample should include a source string, language tag, font, expected invariants, and one or more accepted visual strategies. For typography this complex, a test can often assert “must not break this join” more reliably than one exact pixel image.

### 3. Expand Web Platform Tests

The open [line/paragraph issue #94](https://github.com/w3c/line_paragraph_tests/issues/94) is a starting point. Add tests that separate four questions:

1. Does `text-justify: auto` use an internal Arabic opportunity rather than only spaces?
2. Does the operation preserve the DOM and copied text?
3. Does it preserve shaping across inline boundaries?
4. Does it fall back safely when the font offers no suitable mechanism?

Browser vendors are more likely to implement a feature when conformance is observable and regressions are caught in shared infrastructure.

### 4. File focused engine bugs

Create reduced cases for Blink, Gecko, and WebKit, linked to the W3C issues and tests. Avoid asking each engine to implement a complete scholarly algorithm in one bug. Useful incremental requests include:

- use HarfBuzz or platform justification opportunities in `text-justify: auto`;
- preserve shaping while expanding a cursive run;
- expose and consume font-provided `jalt` or JSTF choices selectively;
- maintain correct selection/copy/search semantics;
- pass one agreed WPT case.

Include performance measurements and fallback behavior. A small implementable first step is more valuable than a broad request with no acceptance criteria.

### 5. Bring font and shaping engineers into the discussion

Browser layout cannot invent font-specific geometry. Involve:

- HarfBuzz maintainers;
- OpenType specification editors;
- Arabic type designers;
- DigitalKhatt and DecoType practitioners;
- browser text-layout engineers;
- experts in Arabic, Persian, and Urdu typography.

Ask what information a formatter needs from a shaper: safe opportunities, adjustment ranges, ranked substitutions, variable-width parameters, and the cost or visual disruption of each choice.

### 6. File a CSSWG issue only after the behavioral case is clear

Current CSS Text requests feedback through the CSSWG issue tracker with a title beginning `[css-text]`. A strong issue should not begin and end with a proposed property name. It should contain:

```markdown
Title: [css-text] Author control and interoperable defaults for Arabic cursive justification

## Problem
Space-only full justification produces poor Arabic typography, while current
`text-justify: auto` does not yield interoperable cursive elongation.

## Existing specification
Quote the current cursive-script and `auto` language.

## Evidence
Link ALReq #225, W3C test #94, desktop precedents, real publications, and a
small reproducible corpus.

## Required invariants
Canonical DOM/clipboard text, preserved joins, language-aware behavior,
dynamic reflow, and safe fallback.

## Staged request
1. Interoperable `auto` behavior.
2. Only then consider an explicit strategy or balance control.

## Open questions
Font APIs, mixed scripts, compression, style selection, and author control.
```

That framing separates the **need** from a premature syntax commitment.

### 7. Use `ar-justify` as evidence, not as the future specification

The library can help advocacy by providing:

- before/after examples;
- a corpus of real Arabic lines;
- measurements of spacing reduction;
- evidence about placement rules and font variance;
- tests for source preservation, selection, copying, search, resize, and print;
- a demonstration of two-column poetry as a real product need.

Its limitations are equally valuable. Selection gaps around generated content, DOM measurement cost, and the need to refresh after layout changes show exactly why the browser’s shaping layer is the better long-term home.

### 8. Gather real users and documents

Standards arguments become stronger when tied to concrete use:

- Arabic books and scholarly editions;
- Qurʾan readers and digital muṣḥafs;
- newspapers and magazines;
- education and dictionaries;
- legal and governmental documents;
- Persian and Urdu publishing;
- classical and contemporary poetry.

For each case, capture what users do besides look at the page: select, copy, search, annotate, zoom, print, change fonts, and use assistive technology.

### A reasonable staged goal

1. **Interoperable default:** `text-align: justify; text-justify: auto` uses a safe Arabic-aware strategy when the language and font permit it.
2. **Font integration:** engines selectively consume shaping and font-provided justification data.
3. **Author preference:** CSS gains a small control for preferring cursive elongation or setting its balance with spaces, based on implementation experience.
4. **Advanced quality:** paragraph-wide optimization, compression, and style-specific behavior improve without changing the text model.

This sequence gives users an improvement early while keeping the standards surface small.

## Annotated sources

### Historical and critical studies

- Titus Nemeth, [“On Arabic justification, part 1 – a brief history”](https://research.reading.ac.uk/typoarabic/on-arabic-justification-part-1/) — terminology, manuscript and mechanical history, Linotype, Monotype, and JusTape.
- Titus Nemeth, [“On Arabic justification, part 2 – software implementations”](https://research.reading.ac.uk/typoarabic/on-arabic-justification-part-2-software-implementations/) — 2019 survey of Adobe, Word, Pages, LibreOffice, browsers, and Mushaf Muscat.
- Titus Nemeth, [“On Arabic justification, part 3 – historical models”](https://research.reading.ac.uk/typoarabic/on-arabic-justification-part-3-historical-models/) — historically informed evaluation of line-fitting practice.
- Mohamed Elyaakoubi and Azzeddine Lazrek, [“Justify Just or Just Justify”](https://doi.org/10.3998/3336451.0013.105), *The Journal of Electronic Publishing* 13(1), 2010 — paragraph optimization and allographic variants.
- Aqil M. Azmi and Abeer Alsaiari, [“An Algorithm to Justify Arabic Text”](http://ecsjournal.org/Archive/Volume37/Issue5/6.pdf), *Egyptian Computer Science Journal* 37(5), 2013 — alternate ligatures and prioritized kashida placement.

### CSS and W3C

- [CSS3 Text Working Draft, 15 May 2002](https://www.w3.org/TR/2002/WD-css3-text-20020515/) — early `text-justify: kashida` syntax.
- [CSS3 Text Candidate Recommendation, 14 May 2003](https://www.w3.org/TR/2003/CR-css3-text-20030514/) — explicit `kashida` value and `text-kashida-space` balance.
- [CSS3 Text Working Draft, 27 June 2005](https://www.w3.org/TR/2005/WD-css3-text-20050627/) — retains explicit kashida justification and the kashida/space balance.
- [CSS Text Level 3 Working Draft, 5 October 2010](https://www.w3.org/TR/2010/WD-css3-text-20101005/) — still defines `text-justify: kashida` as calligraphic elongation.
- [CSS Text Level 3 Working Draft, 13 November 2012](https://www.w3.org/TR/2012/WD-css3-text-20121113/) — the last cited draft in this history to retain the explicit kashida value before its removal.
- [CSS Text Level 3 Working Draft, 10 October 2013](https://www.w3.org/TR/2013/WD-css-text-3-20131010/) — records removal of the explicit kashida value.
- [Current CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/) — `auto`, cursive-script requirements, shaping across boundaries, and current feedback process.
- [Current CSS Text Module Level 4](https://www.w3.org/TR/css-text-4/) — continued language about Arabic cursive elongation without an explicit control.
- [W3C I18N Issue 330](https://www.w3.org/International/track/issues/330), [331](https://www.w3.org/International/track/issues/331), [332](https://www.w3.org/International/track/issues/332), and [333](https://www.w3.org/International/track/issues/333) — the 2014 standards discussion around explanation, missing controls, incomplete requirements, and letter spacing.
- [Arabic & Persian Layout Requirements](https://w3c.github.io/alreq/) and [gap issue #225](https://github.com/w3c/alreq/issues/225) — current requirements and the open justification gap.
- [W3C line/paragraph test issue #94](https://github.com/w3c/line_paragraph_tests/issues/94) — browser test and recorded 2025 results.

### Microsoft and desktop implementation history

- [Internet Explorer `textJustify` documentation](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/aa768972%28v%3Dvs.85%29) — `kashida` value and IE 5.5 support claim.
- [Internet Explorer `textKashidaSpace` documentation](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ff975769%28v%3Dvs.85%29) — percentage control, deprecation, and document-mode behavior.
- [Archived Microsoft article: “Justifying Text Using Cascading Style Sheets”](https://web.archive.org/web/20030719183154/http://www.microsoft.com/middleeast/msdn/JustifyingText-CSS.aspx) — contemporary author documentation.
- [Word 2003 XML `jc` element](https://learn.microsoft.com/en-us/previous-versions/office/developer/office-2003/aa172866%28v%3Doffice.11%29) — low, medium, and high kashida values in the file model.
- [Word 2003 help: “Specify kashida length in Arabic text”](https://documentation.help/MS-Office-Word-2003/wdhowbidiSpecifyKashidaLength.htm) — user-facing Low, Medium, and High modes.
- [Current Word `WdParagraphAlignment` enumeration](https://learn.microsoft.com/en-us/office/vba/api/word.wdparagraphalignment) — continued API constants.
- [Legacy DOC paragraph-property specification](https://learn.microsoft.com/en-us/openspecs/office_file_formats/ms-doc/484822ee-a9d9-4af4-8423-29fda67a6a58) — low, medium, and high paragraph justification encodings.
- [Uniscribe `ScriptJustify`](https://learn.microsoft.com/en-us/windows/win32/api/usp10/nf-usp10-scriptjustify) — glyph-level kashida, word-space, and character-space priority.
- [Publisher 2003: “Set alignment for Kashida”](https://documentation.help/MS-Office-Publisher-2003/SetAlignmentForKashida.htm) — a user-facing slider for the ratio of whitespace to kashida.
- [Adobe InDesign: “Justify Arabic text with automatic Kashida insertion”](https://helpx.adobe.com/indesign/desktop/language-and-proofing/arabic-and-hebrew/justify-arabic-text.html) — current paragraph- and character-level controls for None, Short, Medium, Long, and Stylistic kashidas.

### Font and shaping technology

- [Unicode Arabic shaping data](https://www.unicode.org/Public/UCD/latest/ucd/ArabicShaping.txt) — normative joining properties used by implementations.
- [Unicode Arabic names list](https://www.unicode.org/charts/nameslist/n_0600.html) — U+0640’s name and documented uses.
- [OpenType JSTF](https://learn.microsoft.com/en-us/typography/opentype/spec/jstf) — prioritized font-provided justification actions and extenders.
- [OpenType `jalt`](https://learn.microsoft.com/en-us/typography/opentype/spec/features_fj#jalt) — justification alternates.
- [HarfBuzz buffer and glyph flags](https://harfbuzz.github.io/harfbuzz-hb-buffer.html) — safe-to-insert-tatweel support.
- [Old HarfBuzz Arabic source](https://cgit.freedesktop.org/harfbuzz.old/tree/src/harfbuzz-arabic.c#n336) — historical priority algorithm.
- [OpenOffice line-layout source](https://github.com/mirror/openoffice/blob/ac58ea25d9ea6e57181d6047264340cdc75de79a/main/sw/source/core/text/porlay.cxx#L1145) — historical application implementation.

### Specialized systems and experiments

- [Mushaf Muscat](https://mushafmuscat.om/) — dynamic, interactive Qurʾanic page layout.
- [DigitalKhatt](https://digitalkhatt.org/about) and its [GitHub organization](https://github.com/DigitalKhatt) — parametric Arabic font and justification research.
- [raqim-kashida](https://github.com/aliftype/raqim-kashida) — prioritized insertion-point analysis separated from shaping.
- [Yanone’s `kashida` package](https://github.com/yanone/kashida) — small Naskh-oriented insertion experiment.
- [Stretchable kashida for LaTeX](https://github.com/andreasmhallberg/kashida-justification) — TeX experiment.
- [`kashida-engine`](https://github.com/Nagwa-Limited-Community/kashida-engine) — JavaScript poetry-line width equalization.
- [Stack Overflow browser-support discussion](https://stackoverflow.com/questions/17011065/how-to-get-the-text-justifykashida-css-property-effect-on-to-the-arabic-text) — a durable record of the Web-author problem.

## Conclusion

Arabic justification on the Web is not a new request and not a problem that desktop typography failed to encounter. It has centuries of typographic precedent, decades of software implementation, an early browser implementation, and a former place in CSS.

The Web’s present limitation arose from a convergence of hard factors: inherited mechanical simplifications, incomplete and disputed rules, uneven font support, a division between shaping and paragraph layout, semantics that userland cannot fully preserve, and insufficient interoperable tests. None of those factors makes native support impossible.

The most credible way forward is to make the existing `text-justify: auto` promise real, define and test the invariants of cursive justification, connect browser layout to font and shaping capabilities, and add author control only after interoperable implementation experience exists. JavaScript libraries such as `ar-justify` can bridge the gap and supply evidence. The final solution belongs in the browser.
