<!--
SPDX-FileCopyrightText: © 2025 Rob Hardy
SPDX-License-Identifier: AGPL-3.0-only
-->

[![REUSE status](https://api.reuse.software/badge/bitbucket.org/rahardy/teletext)](https://api.reuse.software/info/bitbucket.org/rahardy/teletext)

![Splash: Prerendered teletext page](https://www.robdev.org.uk/assets/teletext_prerendered_splash.svg)

This package renders teletext pages using vector graphics (SVG). Note this is just the display part of teletext, and operates as a screen or a dumb terminal.  The application using this package will need to supply the page content, implement page numbers, navigation, etc.  The package provides an API to set page content and change the display characteristics such as the screen height and aspect ratio.

This supports all of level 1 and level 1.5, and a little of level 2.5.  A full list follows.  Display rendering features include changing the text font (including proportional fonts), aspect ratio and screen height. Mosaic graphics can be rendered with a font or using SVG graphics. 

Extensions are supported via plugins.

See also: [@techandsoftware/teletext-service](https://www.npmjs.com/package/@techandsoftware/teletext-service), a higher level module with page numbers, subpage and colour button navigation.

## Teletext features supported

* Level 1
    * Screen size of 40 x 25 characters
    * 6 colour foreground text or mosaic characters (also called [semigraphics](https://en.wikipedia.org/wiki/Semigraphics) or [sextants](https://en.wikipedia.org/wiki/Symbols_for_Legacy_Computing))
    * 7 colour background
    * Text displayed using the G0 character sets
    * 20 G0 character sets are available, with up to 96 characters per set. Supports Latin, Greek, Cyrillic, Hebrew and Arabic scripts
    * Primary and secondary G0 sets selectable and switchable
    * Mosaics are contiguous or separated
    * Double height, flashing, concealed, boxed characters
    * Held mosaic characters, to replace the display of a spacing attributes with the last held graphic
    * Newsflash / subtitles page display mode
    * Mix display mode, which isn't part of the teletext spec but is normal on TVs
* Level 1.5
    * Black foreground text or mosaic (this is level 2.5 in the teletext spec but included here at 1.5 as with some TVs)
    * G2 character set selectable from 4 available sets (Latin, Greek, Cyrillic and Arabic)
    * Add enhancements to the base page at (row, col) locations:
       * Place characters from the G0 sets
       * Place diacritical marks on characters from the G0 sets
       * Place characters from the G2 sets
       * Place `@` symbol (it isn't in most G0 sets or the G2 sets)
       * 4 characters from the G3 character set placeable
* Level 2.5
    * Double width and double size characters
    * Add enhancements to base page at (row, col) locations:
      * Place characters from the G1 set (block mosaics)
      * Place characters from the G3 set (smooth mosaics and line drawing)

Additional features:

* Chromecast support via the [@techandsoftware/teletext-caster](https://www.npmjs.com/package/@techandsoftware/teletext-caster) npm package
* API to fill the screen
* Screen drawn with SVG graphics. The SVG is exportable for display in any SVG viewer
* The API supports setting the font for text, change height and aspect ratio, switch teletext levels, set on-screen grid
* Use characters or SVG shapes for rendering mosaics
* Plugin architecture. Plugins can supplement or overwrite the rendering

## Plugins

* [@techandsoftware/teletext-plugin-smooth-mosaic](https://www.npmjs.com/package/@techandsoftware/teletext-plugin-smooth-mosaic) - render smooth mosaic graphics using a pixel art scaling algorithm instead of the usual block mosaics

# Demos

For a live demo, see https://teletextmoduledemo.robdev.org.uk/

See the `demo` directory in the repo for examples of using with an ES6 module import or a UMD import.

# Licensing

The project is licensed under GNU Affero General Public License 3 ([AGPL-3.0-only](https://www.gnu.org/licenses/agpl-3.0.en.html). For commercial support and integration enquiries, contact <techandsoftwareltd@outlook.com>.

The fonts supplied in the `demo/fonts` directory have their own licenses. See the `*.license` files in that directory.

This package is compliant with [REUSE 3](https://reuse.software/).

# Using

## For browsers

Quickstart:

```html
<div id="teletextscreen"></div>

<script type="module">
  import { Teletext } from 'https://cdn.jsdelivr.net/npm/@techandsoftware/teletext@latest/dist/teletext.min.js';

  const teletext = Teletext();
  teletext.addTo('#teletextscreen');
  teletext.setRow(0, 'Hello world!');
</script>
```

If you want to use npm to install instead of jsdelivr:

1. Install dependency:

`npm install @techandsoftware/teletext`

2. In your HTML, include the following to use an an ES6 module:

```html
<div id="teletextscreen"></div>

<script type="module">
  import { Teletext } from './node_modules/@techandsoftware/teletext/dist/teletext.min.js';

  // Or if you import the npm module directly, use the following import instead of the one above. (You will also need tooling to resolve the module for the browser, like @rollup/plugin-node-resolve)
  // import { Teletext } from '@techandsoftware/teletext';

  const teletext = Teletext();
  teletext.addTo('#teletextscreen');
  teletext.setRow(0, 'Hello world!');
</script>
```

This creates an SVG object in the #teletextscreen div which contains the teletext display.

## For nodejs

Your code needs to pass in a document object model window to the `Teletext()` function.

1. Install dependencies:

`npm install @techandsoftware/teletext jsdom`

2. Example code if using ECMAScript modules (requires node >= 16)

```javascript
import { Teletext } from '@techandsoftware/teletext';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<div id="teletextscreen"></div>');

const teletext = Teletext({
    dom: dom.window
});
teletext.addTo('#teletextscreen');
teletext.setRow(0, 'Hello from node');

const svg = dom.window.document.querySelector('#teletextscreen').innerHTML;
```

# Overview of character sets

At level 1, there are two character sets on a page: G0 and G1.  From level 1.5, two more are available: G2 and G3. Each set is 7 bit, with up to 96 characters with codes 0x20 to 0x7f.  A description of each set follows, where the 'base page' refers to the normal grid of 40 x 25 characters, and 'enhancements' refer to writing characters at specific rows and cols on top of the base page. In this module, enhancements can be written at all levels, but are only displayed at level 1.5 and above.

## G0

- Used on base page for the text
- 20 character sets available. See the API docs below for the list.  None of these are ASCII, but `g0_latin` is close.
- At level 1, a primary set is selectable from the available sets
- At level 1.5, primary and secondary G0 set can be selected and used simultaneously
- At level 1.5, can be placed using enhancements
- At level 1.5, diacritics can be placed atop G0 characters as enhancements, from 15 available diacritical marks
- Use: `loadPageFromEncodedString()`, `setPageRows()`, `setRow()`, `setPageFromOutputLines()`, `setRowFromOutputLine()` to write G0 characters to the base page, with attribute characters to switch between G0 and G1.  `enhance().putG0()` writes enhancements with or without diacritics.  `setDefaultG0Charset()` and `setSecondG0Charset()` select the G0 sets in use.  `Attributes.ESC` switches between the primary and secondary sets, if `setSecondG0Charset()` was called.

## G1 "Block Mosaic set"

- Used on base page for block mosaic graphics. (Unicode refers to these as sextants; Wikipedia as semigraphics)
- Mosaic characters are at codes 0x20 to 0x3f and 0x60 to 0x7f. Characters 0x40 to 0x5f in G1 instead show the corresponding characters in the G0 set that's currently selected
- At level 2.5, can be placed using enhancements
- Use: `loadPageFromEncodedString()`, `setPageRows()`, `setRow()`, `setPageFromOutputLines()`, `setRowFromOutputLine()` write G1 characters to the base page, with attribute characters to switch between G0 and G1.  `enhance().putG1()` writes enhancements.

## G2 "Supplementary Sets"

- At level 1.5, placed using enhancements. Not available for use on the base page.
- 4 sets available. See the API docs below for the list.
- Use: `enhance().putG2()` writes enhancements.  `setDefaultG0Charset()` sets the G2 set corresponding with the selected G0 set. `setG2Charset()` sets the G2 set independently of the G0 set.

## G3 "Smooth Mosaics and Line Drawing Set"

- At level 1.5, placed using enhancements. Not available for use on the base page.
  - At level 1.5, four characters are placeable
  - At level 2.5, entire set is placeable
- Use: `enhance().putG3()` writes enhancements

## Other notes

The `@` character is missing from most G0 and G2 sets. At level 1.5, it can be placed as an enhancement. Use: `enhance().putAt()`

The teletext spec also mentions that G2 is not defined at level 1.5, and it's up to a local code of practice to define G2 based on the country's requirements. As the spec doesn't include any of these localised G2 sets, they're not included here.

# API

## Teletext(options)

Returns the teletext instance with the API functions below.

The `options` parameter object is optional, with properties:

* `webkitCompat`: boolean (optional)
   * `true` (default) - the generated SVG is compatible with Safari/Webkit browsers (all browsers on iOS), but it's bigger
   * `false` - uses SVG2 features which work in most browsers but not Safari or any browser on iOS, as they fail to render the graphics properly ([see this bug](https://bugs.webkit.org/show_bug.cgi?id=182172)), unless you use `setView` to switch the view to `classic__font-for-mosaic` (documented below)

* `dom`: object (optional)
   * if running in nodejs you need to pass in a window dom object. See the example above

Call the following methods on the teletext instance to draw on the screen and control the rendering.


## addTo(selector)

`selector` is a DOM selector string, e.g. `#teletextscreen` to match a `<div id="teletextscreen"></div>` element.

This adds a teletext screen to the DOM element referred to by the selector, which will create an inline SVG document to render the screen. If you want to export a snapshot of the SVG, you can access it with `document.querySelector(selector).innerHTML`

## setDefaultG0Charset(charset, withUpdate)

Sets the default G0 character set, and the G2 set with the script matching the G0 set. The character set applies until the function is called again. The default G0 set is `g0_latin`, which is similar to ASCII (it has `¤` instead of `$` and `■` instead of the delete control code). The suffix on the `g0_latin` character set names below correspond to the national option selections defined in ETSI EN 300 706, which modify certain characters from the `g0_latin` set.

`charset` is a string corresponding to one of these:

* g0_latin
* g0_latin\__czech_slovak
* g0_latin\__english
* g0_latin\__estonian
* g0_latin\__french
* g0_latin\__german
* g0_latin\__italian
* g0_latin\__latvian_lithuanian
* g0_latin\__polish
* g0_latin\__portuguese_spanish
* g0_latin\__romanian
* g0_latin\__serbian_croatian_slovenian
* g0_latin\__swedish_finnish_hungarian
* g0_latin\__turkish
* g0_greek
* g0_cyrillic\__russian_bulgarian
* g0_cyrillic\__serbian_croatian
* g0_cyrillic\__ukranian
* g0_arabic
* g0_hebrew

`withUpdate` is an optional boolean. When `true` the display is updated immediately. Defaults to `false`.

There are four G2 sets available. The G2 set which is selected has the same script passed in as the `charset` (for example, if `charset` is `g0_greek` then G2 is set to `g2_greek`.) Hebrew doesn't have a corresponding G2 set, and G2 is set to `g2_arabic`.

For reference, the code charts are on [Wikipedia](https://en.wikipedia.org/wiki/Teletext_character_set), however the character codepoints there don't necessarily match the tables in this codebase (see `src/data/characterEncodings.json`).  The control codes for characters 0 to 1f are used for attributes - see the Attributes section below.

## setSecondG0Charset(charset, withUpdate)

Sets the second G0 character set.  This is used with `Attributes.ESC` (character code 1b) to switch between the default G0 character set and the second G0 character set. The parameters are the same as for `setDefaultG0Charset`. There is no change to the G2 set.

## setG2Charset(charset, withUpdate)

Sets the G2 character set. This can be called to override the G2 set that was selected if `setDefaultG0Charset()` was called.  The G2 set applies until the function is called again or if `setDefaultG0Charset()` is called.

`charset` is a string corresponding to one of these:

* g2_latin
* g2_greek
* g2_cyrillic
* g2_arabic

`withUpdate` is an optional boolean. When `true` the display is updated immediately. Defaults to `false`.

## setPageRows([strings])

Display the content in the strings. Array of up to 25 elements. Each element is a string up to 40 characters. This is used to set the contents of the whole screen.

Display attributes such as text or graphic colour, flashing and other features are set with control codes defined by ETSI EN 300 706. These can be embedded directly in the strings or are exposed via an `Attributes` class to generate them. See the section below. 

## setRow(rowNum, string)

Display the string on the row number. `rowNum` is between 0 and 24. The string is up to 40 characters.  Display attributes in the string can be used - see the section below.

## loadPageFromEncodedString(base64input, header)

Displays a page from the `base64input`.  The input is a base64-encoded string of 7-bit characters for the 25 rows x 40 characters concatenated together. The encoded string uses the character repertoire defined in the [base64url encoding](https://tools.ietf.org/html/rfc4648#section-5). This format is taken from the URL hash fragment format used by Simon Rawles' online edit.tf teletext editor. See further details here: https://github.com/rawles/edit.tf

`header` is optional. When supplied, it replaces row 0 on the displayed page. It's a string of 32 characters. It can use the Output Line format but without the initial `OL,rowNum,`. See `setPageFromOutputLines` for the format.

## setRowFromOutputLine(rowNum, string)

This is a wrapper around `setRow` which accepts the Output Line format used in .tti files, but without the initial `OL,rowNum,` at the beginning. It displays the string on the row number after decoding the Output Line. See `setPageFromOutputLines` for the format. `rowNum` is between 0 and 24.

## setPageFromOutputLines([lines], header)

This is a wrapper around `setPageRows` which accepts strings in the Output Line format used in MRG's .tti files. The lines are displayed after being decoded. `lines` is an array with up to 25 elements in this format:

`OL,rowNum,line`

In this:

* `rowNum` is between 0 and 24
* `line` is the string to display. Attribute characters (character codes less than 0x20) are represented in three ways: 1) As they are with no translation, or 2) They have 0x80 added to translate them to characters with codes 128-159, or 3) they are replaced by escape (character 0x1b) then the character with 0x40 added.

`header` is optional. When present, it's a string of 32 characters, which have the same encoding as the Output Lines but without the initial `OL,rowNum,` . This is used as the header row and is used instead of Output Line 0 in the provided `lines`. When not provided, the row 0 in the `lines` is used if there is one. 

## writeBytes(colNum, rowNum, [lines])

Writes each line in the array to the screen starting from `colNum`, `rowNum`.  This allows you to place a block of text on the screen without affecting existing characters. `colNum` is from 0 to 39, `rowNum` from 0 to 24.

## writeByte(colNum, rowNum, byte, withUpdate)

Writes the byte to the `colNum`, `rowNum`.  `colNum` is from 0 to 39, `rowNum` from 0 to 24. The `byte` should have a character code of 0x0 to 0x127. The byte won't display literally, as the display uses the active G0 character set and spacing attributes to work out what to show.

`withUpdate` is an optional boolean, default is `false`. When true, the page display is updated.

## plot(graphicColNum, graphicRowNum)

Plots a pixel. The coordinates are from (0, 0) to (79, 74). The origin is the top-left. Note this uses a different coordinate scheme than methods like `writeBytes()`, which refer to the character cell rows and columns. For performance, there is no range checking, so the display will crash if you try to plot outside of the range. The page display is not updated. You can force an update with `updateDisplay()`.

This generates a 2x3 mosaic (sextant) character corresponding to the character cell in the page model that you're plotting to. Existing mosaics in the cell are modified to plot the pixel. If characters with codes 0x0 to 0x1f are in the target cell, these are unchanged so that spacing atributes are preserved, and the plot has no effect. If characters with codes 0x40 to 0x5f are at the character position you're plotting to, this is cleared first.

To use this, you will first need to set graphics mode for the text row by writing a graphic spacing attribute, for example by using `writeByte()` and `Attributes.charfromGraphicColour(colour)`.

## plotPoints(graphicColNum, graphicRowNum, numPixelsPerRow, pixelsArray)

Plots multiple pixels, with the top left origin of (`graphicColNum`, `graphicRowNum`) and `numPixelsPerRow`. This internally calls `plot()`. The top-left coordinates are (0, 0) to (79, 74). As with `plot()`, existing spacing attributes are not overridden, and the display is not updated. You can force an update ewith `updateDisplay()`.  Unlike `plot()`, `plotPoints()` does range checking to ensure the plotted pixels fit on the display.

`numPixelsPerRow` is the number of pixels for each row in the `pixelsArray`.

`pixelsArray` is an array of bytes. Each byte represents a pixel. If its value is 255 then a point is plotted. If it's not 255, the point is unplotted. (This is intended to be easy to generate from some other bitmap pixel source).

To use this, you will first need to set graphics mode for each text row by writing a graphic spacing attribute, for example by using `writeByte()` and  `Attributes.charfromGraphicColour(colour)`.

## clearScreen(withUpdate)

Clears the screen.  `withUpdate` is an optional boolean, default is `true`. When `true`, the page is cleared immediately.  When `false` the page model is cleared but the display is not updated.  In that case, the screen is cleared the next time you call a function which updates the display, such as `setPageRows`.

## remove()

Removes the teletext display from the DOM.

## showTestPage()

4 test pages are built-in. This displays a test page, rotating through these every time this is called. The test pages were kindly supplied by https://archive.teletextarchaeologist.org/

## toggleGrid()

Show or a hide a grid. The grid shows the rows and cells.

## showRandomisedPage()

Randomises the display data. This doesn't have a practical use but emulates a dodgy TV signal and creates a nice mash of display attributes.

## setAspectRatio(value)

`value` is a number or the string `natural`.

Set the aspect ratio of the display.  The page height is kept and the width adjusted. The display's default aspect ratio is 1.2 to match typical teletext displays. The special value of `natural` removes pixel distortion - so the pixels are square - but the page looks squashed.

## setHeight(heightInPixels)

Sets the screen height to the number of pixels you passed in. The aspect ratio is maintained. You could set the screen to fill the available window height using `document.documentElement.clientHeight` as the value. If you use CSS for layout you probably don't need to use this.

## setFont(font)

Sets the text font. `font` is a string, which can be a string corresponding to a CSS [font family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) or a couple of special values.

Special values are:
* `native` - uses the native font specific to your operating system. The actual font used depends on your system. Sourced from [bootstrap 4's native font stack](https://getbootstrap.com/docs/4.1/content/reboot/#native-font-stack).
* `default` - uses the generic font family sans-serif 

Bedstead and Unscii are retro fonts you might want to use in your app if that's the look you want.  You can get them with `npm install @techandsoftware/teletext-fonts` . For Bedstead and Unscii to work correctly, you need to put them in a `fonts` subdirectory relative to the page containing the teletext display div
* `Bedstead` - a font emulating the mode 7 character generator on a BBC Micro, by bjh21.
* `Unscii` - a blocky retro-computing font by Viznut.

Normal values for `font` include `serif`, `sans-serif`, `monospace` and specific font family names of the sort you'd use in a CSS stylesheet, which might be browser- or OS-specific. Your containing HTML page can supply its own font family (using Google Fonts, for example) and then refer to it here. Even though the teletext layout is grid-based, you can use a proportional font and the grid is maintained.

If `g0_arabic` was set as the character set, the characters are rendered differently so that they're cursive. Whether this works correctly depends on your font.

## setView(view)

`view` is a string with one of these values:
* `classic__font-for-mosaic` - render mosaic graphics using a font
* `classic__graphic-for-mosaic` - render mosaic graphics using SVG shapes.  This is the default view.

When using `classic__font-for-mosaic`, the contiguous mosaic characters use codepoints defined in Unicode [Symbols for Legacy Computing](https://en.wikipedia.org/wiki/Symbols_for_Legacy_Computing). The separated mosaic characters use private use codepoints because the separated mosaics are missing from Unicode's legacy computing block.  The mosaic characters use the Unscii font. For this to work, you need to supply Unscii in a `fonts` subdirectory relative to the page containing the teletext display div.  Unscii is available with `npm install @techandsoftware/teletext-fonts` or downloadable from http://viznut.fi/unscii/ .

Using the font will result in a smaller SVG.  If you export the SVG from the DOM then you will need to ensure the Unscii font is available so that the SVG can be viewed properly in isolation. Because of issues with getting the edges of the mosaics to join up without gaps, the font size is slightly bigger than it should be. Using SVG graphics for the mosaics is more portable, and the mosaics are more precisely positioned.

## updateDisplay()

Force an update of the display. This is useful in certain cases where the page model has been updated and the display is not automatically updated, for example with `plot()`.

## enhance()

Returns an `enhancement` instance.  This is used to overwrite characters on top of the base page. It can be used to write diactitics on G0 characters, and also gives access to characters from the G2 and G3 character sets.  Enhancements aren't displayed at Level 0 or Level 1; you need to call `setLevel()` with `Level[1.5]` or `Level[2.5]`.  The enhancement instance provides the methods below to write the enhancements. The enhancements are cleared with a call to `setPageRows()`, `setPageFromOutputLines()`, `loadPageFromEncodedString()`, `clearScreen()` or `showTestPage()`.

The *position* is a bit like a cursor and analogous to the Active Position in the teletext spec. Call `pos()` to update it, and subsequent calls apply to that position.  Characters are not displayed until `end()` is called on the enhancement instance.  The methods can be chained together, for example `enhance().pos(2, 5).putG0('e', 2).end()` .

The methods are:

### pos(col, row)

Updates the *position* to the `col` and `row`.  The *position* is only updated when this function is called.  The initial position is 0, 0, which is the top left.

### putG0(char, diacriticCode)

Requires level 1.5 or 2.5.  Writes a character from the current G0 set at the *position*.

`char` is a character with a code between 0x20 and 0x7f.

`diacriticCode` is optional, and is a number between 0 and 15.  If it's not provided or if its value is 0, the char is written without a diacritic.  Values 1 to 15 correspond to the diacritics in column 4 of the g2_latin set, which are: 

| `diacriticCode` | diacritic |
|-----------------|-----------|
| 1               | ◌&#x300;  |
| 2               | ◌&#x301;  |
| 3               | ◌&#x302;  |
| 4               | ◌&#x303;  |
| 5               | ◌&#x304;  |
| 6               | ◌&#x306;  |
| 7               | ◌&#x307;  |
| 8               | ◌&#x308;  |
| 9               | ◌&#x323;  |
| 10              | ◌&#x30a;  |
| 11              | ◌&#x327;  |
| 12              | ◌&#x332;  |
| 13              | ◌&#x30b;  |
| 14              | ◌&#x328;  |
| 15              | ◌&#x30c;  |

### putG1(char)

Requires level 2.5. Writes a block mosaic character from the G1 set at the *position*.

`char` is a character with a code between 0x20 to 0x3f or 0x60 to 0x7f. Character codes 0x40 to 0x5f have no effect.

### putG2(char)

Requires level 1.5 or 2.5.  Writes a character from the current G2 set at the *position*.

`char` is a character with a code between 0x20 and 0x7f.

### putG3(char)

Requires level 1.5 or 2.5.  Writes a smooth mosaic or line drawing character from the G3 set at the *position*.  Level 1.5 supports 4 characters. Level 2.5 supports the entire set.

`char` is a character with a code between 0x20 and 0x7d.  At level 1.5, only characters 51, 5b, 5c and 5d are displayed.

Character 5f isn't supported, which is intended to show the level 2.5 row background colour in the teletext spec.

The G3 characters are written using the codepoints defined by Unicode for Symbols for Legacy Computing.  You can use the Unscii font to display these correctly. Put Unscii in a `fonts` subdirectory relative to the page containing the teletext display div.  Unscii is available with `npm install @techandsoftware/teletext-fonts` or downloadable from http://viznut.fi/unscii/ .

### putAt()

Requires level 1.5 or 2.5. Writes a `@` character at the *position*.  This is needed because `@` is missing from most G0 and G2 sets, and the teletext spec has special provision for it.

### end()

Finish adding enhancements, and the display is updated.

## setLevel(level)

Sets the teletext level used to display the page. The value is a property on the `Level` object.  `Level` is importable:

```javascript
import { Level } from '@techandsoftware/teletext'
```

Values are `Level[0]`, `Level[1]`, `Level[1.5]`, `Level[2.5]`.  Level 0 isn't a real teletext level, but uses a subset of the spacing attributes roughly corresponding to Ceefax test pages from 1975 (no background colours, double height, reveal, boxed or held mosaic).  Levels 1 to 2.5 are from the ETSI spec. The default is Level 1.

## registerViewPlugin(plugin)

Pass in a plugin class. The plugin can hook in and override parts of the page rendering using a plugin interface.

## toggleReveal()

Toggles reveal on or off to show or hide concealed characters. The initial state is to conceal, and the reveal state is reset to concealed on API calls which update the page, set the character set (when `withUpdate` is true) or set the level.  See also the `ttx.reveal` event.

## toggleMixMode()

Toggle mixed display mode on or off.  See also the `ttx.mix` event.

## toggleBoxMode()

Toggles boxed display mode on or off. See also the `ttx.subtitlemode` event.

## getBytes()

Gets the raw bytes used in the page model. The response is a `Uint8Array` with 1000 elements. As each teletext byte is 7-bit, the element values will be between 0 and 127 inclusive.

## getScreenImage()

Gets a static image of the screen. This returns SVG markup.

## Event API

Your application can dispatch these events as an alternative to using the teletext instance API.

| Event | Use |
|-------|------|
|`ttx.reveal` | toggles reveal. If the page contains concealed characters, then this shows or hides them.  This is used for things like punchlines or quizzes.  This corresponds to a 'reveal' button on a TV remote control. This has no effect if the page doesn't have any concealed characters. The initial state is to conceal, and the reveal state is reset to concealed on API calls which update the page, set the character set (when `withUpdate` is true) or set the level. |
| `ttx.mix` | toggles mix display mode.  When mixed, the page background colours are hidden. In a real TV this would display the TV picture with text on top. For your app, it would display whatever you have positioned behind the screen or used as the html body background. |
| `ttx.subtitlemode` | toggles boxed display mode.  A page can contain 'boxed' characters. When in boxed mode, the boxed characters display on top of the TV picture, which is used for subtitles or a newsflash page.  Non-boxed characters are hidden. On a broadcast teletext service, the broadcaster decides whether the page is displayed in boxed mode or not. If the page doesn't contain any boxed characters, the page is blank, so that the screen shows the TV picture. For your app, the display shows whatever you have positioned behind the screen or used as the html body background. |

You can send an event like this in your application:

```javascript
window.dispatchEvent(new Event('ttx.reveal'));
```

# Attributes

Control code characters set display attributes which control the text colour, double height, flashing etc. The default attributes at the beginning of a row are white text on a black background, single height, not flashing, not boxed, not concealed, no held mosaic. Graphics, when activated, default to contiguous. When an attribute is set it stays activated until the end of the row. An attribute takes up a space unless hold mosaics is active, in which case the held mosaic is used.

To help with the codes, the `Attributes` and `Colour` objects can be used when composing strings for `setPageRows()` and `setRow()`.

```javascript
import { Attributes, Colour } from '@techandsoftware/teletext';
```

## Attributes.charFromTextColour(colour)
## Attributes.charfromGraphicColour(colour)

Sets text mode or graphic mode for the specified colour. `colour` is one of these:

* Colour.RED 
* Colour.GREEN
* Colour.YELLOW
* Colour.BLUE
* Colour.MAGENTA
* Colour.CYAN
* Colour.WHITE
* Colour.BLACK - black was added in level 2.5, but is included here at level 1.5 and ignored at level 1

 Characters in the row after this attribute are processed depending on the text or graphics mode that has been set. For text mode, the characters are mapped according to the G0 character set.  For graphics mode, characters draw block mosaics from the G1 character set if the character code is 20 to 3f or 60 to 7f; characters 40 to 5f show the character from the G0 set with the same code.

## Attributes.charFromAttribute(attribute)

Gets the code for an attribute. `attribute` is one of these:

| Attribute                     | Use                                |
|-------------------------------|------------------------------------|
| Attributes.NEW_BACKGROUND     | set the background colour to the current foreground colour |
| Attributes.BLACK_BACKGROUND   | set the background colour to black |
| Attributes.CONTIGUOUS_GRAPHIC | set the mosaic graphics to contiguous blocks |
| Attributes.SEPARATED_GRAPHIC  | set the mosaic graphics to separated blocks |
| Attributes.FLASH              | activate flashing for text/mosaic |
| Attributes.STEADY             | deactivate flashing for text/mosaic |
| Attributes.NORMAL_SIZE        | set text/mosaic to normal height |
| Attributes.DOUBLE_HEIGHT      | set text/mosaic to double height. The row below will be hidden. Background colours on this row will be extended to the row below. Single height characters on the top row stay single height but their background colour is still extended to the lower row |
| Attributes.DOUBLE_WIDTH       | set text/mosaic to double width. Double width characters use two cells, and the character in the next cell is hidden. Requires Level 2.5 to be set |
| Attributes.DOUBLE_SIZE        | set text/mosaic to double size. Double size characters use four cells. The row below is hidden as per double height, and the character in the cell after a double size character is hidden as per double width. Requires Level 2.5 to be set |
| Attributes.CONCEAL            | text/mosaic characters show as spaces until reveal is pressed. For use with `toggleReveal()` / `ttx.reveal`. The concealed atttribute is active until the next colour attribute (or the end of the row) |
| Attributes.HOLD_MOSAICS       | stores the last mosaic character seen on a row (going left to right) so that on the next spacing attribute the held mosaic is used instead of a space. A practical use is in a row of graphics, so that the colour could be changed without a space, with the space being filled in with the mosaic before the colour change. The held mosaic is reset to a space with a change of size or text/graphics mode |
| Attributes.RELEASE_MOSAICS    | cancels held mosaic mode, so that attributes will show a space and not the held mosaic. The held mosaic isn't reset to a space |
| Attributes.START_BOX          | starts boxed characters (used for subtitles, newsflash). Two adjacent start box characters need to be used, with the box starting between the two. For use with `toggleBoxMode()` |
| Attributes.END_BOX            | ends boxed characters. Two adjacent end box characters need to be used, with the box ending between the two. |
| Attributes.ESC                | switch between the default G0 character set and the second G0 character set.  This requires the second G0 character set to have been set with `setSecondG0Charset`.  If this hasn't been set, the attribute has no effect |

As an example, to set red text on a yellow background, you will need:

```javascript
teletext.setPageRow(0, Attributes.charFromTextColour(Colour.YELLOW) +
    Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) +
    Attributes.charFromTextColour(Colour.RED) + "Red on yellow");
```

The attributes take up 3 spaces before the text.

If you prefer to use the control codes directly, check the source of Attributes.js or the teletext spec to get the control code values. Double height, for instance, is code 13 (or d in hexadecimal), so you could use strings like `"\x0d"`, `"\u{d}"`, `String.fromCharCode(13)`.

# TODO

These features of [ETSI EN 300 706](https://www.etsi.org/deliver/etsi_en/300700_300799/300706/01.02.01_60/en_300706v010201p.pdf) aren't supported yet. I'm not sure how much is worth doing:

At Level 2.5 or 3.5:
* non-spacing attributes. The non-spacing attributes include underline, inverse, bold, italic, proportional text and extra flashing modes in addition to the normal level 1 attributes
* 32 colours via 4 colour tables
* colour table selection and remapping
* default screen/row colours
* side panels
* redefinable characters
* modified G0/G2 set selectable for use with enhancements

The spec also defines navigation and object pages, which I consider out of scope as they're more in the domain of the application rather than the display.

# Bugs

If you encounter any issues, contact techandsoftwareltd@outlook.com

# Credits

* Unscii font used for block graphics when `setView` or `enhance().putG3()` is called - http://viznut.fi/unscii/
* Bedstead font - http://bjh21.me.uk/bedstead/
* Native font stack adapted from Bootstrap's - https://getbootstrap.com/docs/4.5/content/reboot/#native-font-stack
* The internal API used for drawing SVG is a subset of svg.js v3 - https://svgjs.dev/docs/3.0/
* Teletext test pages from https://archive.teletextarchaeologist.org/
* The data format for stored test pages and for the `loadPageFromEncodedString` API is from Simon Rawles' teletext editor - https://edit.tf/
* The Output Line format is taken from MRG's .tti file spec - https://zxnet.co.uk/teletext/documents/ttiformat.pdf
