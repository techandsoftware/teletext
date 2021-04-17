<!--
SPDX-FileCopyrightText: © 2021 Tech and Software Ltd.
SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-uk.ltd.TechAndSoftware-1.0
-->

![Splash: Prerendered teletext page](https://bitbucket.org/rahardy/teletext/raw/0d1345a4afe61b422b3068e45c95a36da97b9363/demo/prerendered_splash.svg)

This package renders teletext pages using vector graphics (SVG). Note this is just the display part of teletext, and operates as a screen or a dumb terminal.  The application using this package will need to supply the page content, implement page numbers, navigation, etc.  The package provides an API to set page content and change the display characteristics such as the screen height and aspect ratio.

This supports most of level 1/1.5 and a little of level 2.5.  A full list follows.  Display rendering features include changing the text font (including proportional fonts), aspect ratio and screen height. Mosaic graphics can be rendered with a font or using SVG graphics. 

Extensions are supported via plugins.

## Teletext features supported

* Level 1
    * Screen size of 40 x 25 characters
    * 6 colour foreground text or mosaic characters (also called semigraphics or sextets)
    * 7 colour background
    * Text displayed using the G0 character sets
    * XX character sets are available, with XX characters per set. Supports Latin, Greek, Cyrillic, Hebrew and Arabic scripts
    * Primary and secondary g0 sets selectable and switchable
    * Mosaics are contiguous or separated
    * Double height, flashing, concealed, boxed characters
    * Held mosaic characters, to replace the display of a spacing attributes with the last held graphic
    * Newsflash page display mode
    * Mix display mode, which isn't part of the teletext spec but is normal on TVs
* Level 1.5
    * Black foreground text or mosaic (this is level 2.5 in the teletext spec but included here at 1.5 as with some TVs)
    * g2 set selectable
    * ~~Diacritical marks on characters from the g0 sets placeable~~ TODO
    * ~~g2 character sets and character placement~~ TODO
    * ~~4 characters from the g3 character set placeable~~ TODO
    * ~~`@` is placeable (it isn't in most g0 sets or the g2 sets)~~ TODO
* Level 2.5
    * Double width and double size characters
    * ~~Modified g0/g2 set selectable for placing characters~~ TODO

Additional features:

* Chromecast support
* API to fill the screen
* Screen drawn with SVG graphics. The SVG is exportable for display in any SVG viewer
* The API supports setting the font for text, change height and aspect ratio, switch teletext levels, set on-screen grid
* Use characters or SVG shapes for rendering mosaics
* Plugin architecture. Plugins can supplement or overwrite the rendering, for example to use pixelart scaling to render smooth graphics instead of the normally blocky mosaics

## Plugins

* [@techandsoftware/teletext-plugin-smooth-mosaic](https://www.npmjs.com/package/@techandsoftware/teletext-plugin-smooth-mosaic) - render smooth mosaic graphics using a pixel art scaling algorithm instead of the usual block mosaics

# Licensing

The project is licensed under GNU Affero General Public License 3 ([AGPL-3.0-only](https://www.gnu.org/licenses/agpl-3.0.en.html)), or under a commerical software license ([LicenseRef-uk.ltd.TechAndSoftware-1.0](https://bitbucket.org/rahardy/teletext/src/HEAD/LICENSES/LicenseRef-uk.ltd.TechAndSoftware-1.0.txt)) if you have paid a licensing fee to Tech and Software Ltd. If you combine your own software with this package and distribute publically (whether via network access or not), the AGPL requires that your software is covered by AGPL; the commerical license does not have that requirement. In order to pay the fee for the commerical license, contact <techandsoftwareltd@outlook.com> for enquiries. The text of the licenses is in the `LICENSES` directory.

The fonts supplied in the `demo/fonts` directory have their own licenses. See the `*.license` files in that directory.

This package is compliant with [REUSE 3](https://reuse.software/).

# Using

```npm install @techandsoftware/teletext```

## As an ES6 module

```html
<script type="module">
// Import as an ES6 module
import { teletext } from './node_modules/@techandsoftware/teletext/dist/teletext.min.js';

// Or import the npm module (you will also need tooling to resolve the module for the browser)
import { teletext } from '@techandsoftware/teletext';

teletext.addTo('#teletextscreen');
teletext.setRow(0, 'Hello world!');
</script>

<div id="teletextscreen"></div>
```

This creates an SVG object in the #teletextscreen div which contains the teletext display.

## Using `script src`

For browsers that don't support ES6 module imports, you can use the UMD module. The exports are exported to the `ttx` global, so you need to prefix API calls with that.

```html
<script src="./node_modules/@techandsoftware/teletext/dist/teletext.umd.min.js"></script>
<script>
ttx.teletext.addTo('#teletextscreen');
</script>
<div id="teletextscreen"></div>
```

See the `demo` for examples of these.

# API

The `teletext` object is exported by `@techandsoftware/teletext`, and supports the methods below for drawing on the screen and controlling the rendering.

## addTo(selector)

`selector` is a DOM selector string, e.g. `#teletextscreen` to match a `<div id="teletextscreen"></div>` element.

This adds a teletext screen to the DOM element referred to by the selector, which will create an inline SVG document to render the screen. If you want to export a snapshot of the SVG, you can access it with `document.querySelector(selector).innerHTML`

## setDefaultG0Charset(charset, withUpdate)

Sets the default g0 character set. The character set applies until the function is called again. The default set is `latin_g0`, which is similar to ASCII (it has `¤` instead of `$` and `■` instead of the delete control code). The suffix on the `latin_g0` character set names below correspond to the national option selections defined in ETSI EN 300 706, which modify certain characters from the `latin_g0` set. 

`charset` is a string corresponding to one of these:

* latin_g0
* latin_g0\__czech_slovak
* latin_g0\__english
* latin_g0\__estonian
* latin_g0\__french
* latin_g0\__german
* latin_g0\__italian
* latin_g0\__latvian_lithuanian
* latin_g0\__polish
* latin_g0\__portuguese_spanish
* latin_g0\__romanian
* latin_g0\__serbian_croatian_slovenian
* latin_g0\__swedish_finnish_hungarian
* latin_g0\__turkish
* greek_g0
* cyrillic_g0\__russian_bulgarian
* cyrillic_g0\__serbian_croatian
* cyrillic_g0\__ukranian
* arabic_g0
* hebrew_g0

`withUpdate` is an optional boolean. When `true` the display is updated immediately. Defaults to `false`.

For reference, the code charts are on [Wikipedia](https://en.wikipedia.org/wiki/Teletext_character_set), however the character codepoints there don't necessarily match the tables in this codebase (see `src/data/characterEncodings.json`).  The control codes for characters 0 to 1f are used for attributes - see the Attributes section below.

## setSecondG0Charset(charset, withUpdate)

Sets the second g0 character set.  This is used with `Attributes.ESC` (character code 1b) to switch between the default g0 character set and the second g0 character set. The parameters are the same as for `setDefaultG0Charset`.

## setPageRows([strings])

Display the content in the strings. Array of up to 25 elements. Each element is a string up to 40 characters. This is used to set the contents of the whole screen.

Display attributes such as text or graphic colour, flashing and other features are set with control codes defined by ETSI EN 300 706. These can be embedded directly in the strings or are exposed via an `Attributes` class to generate them. See the section below. 

## setRow(rowNum, string)

Display the string on the row number. `rowNum` is between 0 and 24. The string is up to 40 characters.  Display attributes in the string can be used - see the section below.

## loadPageFromEncodingString(base64input)

Displays a page from the `base64input`.  The input is a base64-encoded string of 7-bit characters for the 25 rows x 40 characters concatenated together. The encoded string uses the character repertoire defined in the [base64url encoding](https://tools.ietf.org/html/rfc4648#section-5). This format is taken from the querystring format used by Simon Rawles' online edit.tf teletext editor. See further details here: https://github.com/rawles/edit.tf

## clearScreen(withUpdate)

Clears the screen.  `withUpdate` is an optional boolean, default is `true`. When `true`, the page is cleared immediately.  When `false` the page model is cleared but the display is not updated.  In that case, the screen is cleared the next time you call a function which updates the display, such as `setPageRows`.

## remove()

Removes the teletext display from the DOM.

## showTestPage()

3 test pages are built-in. This displays a test page, rotating between the 3 every time this is called. The test pages were kindly supplied by https://archive.teletextarchaeologist.org/

## toggleGrid()

Show or a hide a grid. The grid shows the rows and cells.

## showRandomisedPage()

Randomises the display data. This doesn't have a practical use but emulates a dodgy TV signal and creates a nice mash of display attributes.

## setAspectRatio(value)

`value` is a number or the string `natural`.

Set the aspect ratio of the display.  The page height is kept and the width adjusted. The display's default aspect ratio is 1.2 to match typical teletext displays. The special value of `natural` removes pixel distortion - so the pixels are square - but the page looks squashed.

## setHeight(heightInPixels)

Sets the screen height to the number of pixels you passed in. The aspect ratio is maintained. You could set the screen to fill the available window height using `document.documentElement.clientHeight` as the value.

## setFont(font)

Sets the text font. `font` is a string, which can be a string corresponding to a CSS [font family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) or a couple of special values.

Special values are:
* `Bedstead` - a font emulating the mode 7 character generator on a BBC Micro, by bjh21. [Source](https://bjh21.me.uk/bedstead/)
* `Unscii` - a blocky retro-computing font by Viznut. [Source](http://viznut.fi/unscii/)
* `native` - uses the native font specific to your operating system. The actual font used depends on your system. Sourced from [bootstrap 4's native font stack](https://getbootstrap.com/docs/4.1/content/reboot/#native-font-stack).

For Bedstead and Unscii to work correctly, you need to put them in a `fonts` subdirectory relative to the page containing the teletext display div.

Normal values include `serif`, `sans-serif`, `monospace` and specific font family names of the sort you'd use in a CSS stylesheet, which might be browser- or OS-specific. Your containing HTML page can supply its own font family (using Google Fonts, for example) and then refer to it here. Even though the teletext layout is grid-based, you can use a proportional font and the grid is maintained.

When using the `arabic_g0` character set, the cursive Arabic characters are displayed but not in the right way, yet, as the characters aren't in the joined form.

## setView(view)

`view` is a string with one of these values:
* `classic__font-for-mosaic` - render mosaic graphics using a font
* `classic__graphic-for-mosaic` - render mosaic graphics using SVG shapes.  This is the default view.

When using `classic__font-for-mosaic`, the contiguous mosaic characters use codepoints defined in Unicode [Symbols for Legacy Computing](https://en.wikipedia.org/wiki/Symbols_for_Legacy_Computing). The separated mosaic characters use private use codepoints because the separated mosaics are missing from Unicode's legacy computing block.  The mosaic characters use the Unscii font. For this to work, you need to supply Unscii in a `fonts` directory relative to the page containing the teletext display div.

Using the font will result in a smaller SVG.  If you export the SVG from the DOM then you will need to ensure the Unscii font is available so that the SVG can be viewed properly in isolation. Because of issues with getting the edges of the mosaics to join up without gaps, the font size is slightly bigger than it should be. Using SVG graphics for the mosaics is more portable, and the mosaics are more precisely positioned.

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

## Event API

Your application can dispatch these events as an alternative to using the API.

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

 Characters in the row after this attribute are processed depending on the text or graphics mode that has been set. For text mode, the characters are mapped according to the g0 character set.  For graphics mode, characters draw block mosaics from the g1 character set if the character code is 20 to 3f or 60 to 7f; characters 40 to 5f show the character from the g0 set with the same code.

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
| Attributes.END_BOX            | ends boxed characters |
| Attributes.ESC                | switch between the default g0 character set and the second g0 character set.  This requires the second g0 character set to have been set with `setSecondG0Charset`.  If this hasn't been set, the attribute has no effect |

As an example, to set red text on a yellow background, you will need:

```javascript
Attributes.charFromTextColour(Colour.YELLOW) +
Attributes.charFromAttribute(Attributes.NEW_BACKGROUND) +
Attributes.charFromTextColour(Colour.RED)
```

This takes up 3 spaces.

If you prefer to use the control codes directly, check the source of Attributes.js or the teletext spec to get the control code values. Double height is code 13 (or d in hexadecimal), so you could use strings like `"\x0d"`, `"\u{d}"`, `String.fromCharCode(13)`.

# TODO

These features of [ETSI EN 300 706](https://www.etsi.org/deliver/etsi_en/300700_300799/300706/01.02.01_60/en_300706v010201p.pdf) aren't supported yet:

* Level 1.5
    * Set g2 charset
    * Place 'a few' characters from the g2 supplementary character set, although the g2 set isn't defined precisely at level 1.5
    * Place diacritics from the g2 set onto 'a few' g0 characters
    * Place 4 characters from the g3 set
    * Place `@` which is missing from most g0 sets and all g2 sets
* Level 2.5 and 3.5
    * all features need to be added apart from black foreground text/graphics (which I've included in 1.5), and double width and double size spacing attributes

For Level 2.5 and 3.5, the ETSI spec includes full g3 character set support (smoothed block mosaic and line drawing characters), g2 character set selection, 32 colours via 4 colour tables, colour table selection and remapping, side panels, non-spacing attributes, default screen/row colours, redefinable characters.  The non-spacing attributes include underline, inverse, bold, italic, proportional text and extra flashing modes in addition to level 1 attributes.  I'm not sure how much is worth implementing.

The spec also defines navigation and object pages, which I consider out of scope as they're more in the domain of the application rather than the display.

APIs needed:
1. `enhance()`
2. `setPosition(row, col)`
3. `putCharFromCharset(charset, string, diacriticalCode)` where `charset` is `g0` (level 1.5), `g1` (2.5), `g2` (1.5) or `g3` (1.5 for 4 chars, 2.5 for the rest)
4. `putAtSign()` (level 1.5)
5. `putChars(string)`
6. `update()`

Level 2.5/3.5 allows for a 'modified g0 and g2 character set', then writing g0/g2 characters uses that.

# Bugs

Arabic script isn't rendered correctly as the characters aren't joined.

# Credits

* Unscii font used for block graphics - http://viznut.fi/unscii/
* Bedstead font - http://bjh21.me.uk/bedstead/
* Native font stack adapted from Bootstrap's - https://getbootstrap.com/docs/4.5/content/reboot/#native-font-stack
* The internal API used for drawing SVG is a subset of svg.js v3 - https://svgjs.com/docs/3.0/
* Teletext test pages from https://archive.teletextarchaeologist.org/
* The data format for stored test pages and for the `loadPageFromEncodingString` API is from Simon Rawles' teletext editor - https://edit.tf/
