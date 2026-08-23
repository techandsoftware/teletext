<!-- SPDX-FileCopyrightText: © 2026 Rob Hardy
     SPDX-License-Identifier: AGPL-3.0-only -->

# v1.3.1
* `getScreenImage()` returns cleaner SVG without unused elements, which can accumulate after multiple screen redraws
* Uses shadow DOM for the internal DOM tree

# v1.3.0

* added `getText()` - returns plain text render
* `webkitCompat` init parameter defaults to false as the [webkit SVG bug](https://bugs.webkit.org/show_bug.cgi?id=182172) was fixed mid-2023

# v1.2.1

* fixed a rendering bug involving cursive Arabic characters

# v1.2.0

* documentation moved from README to https://teletext-for-javascript-docs.robdev.org.uk/teletext-features
* `withUpate` parameter added to `writeBytes()`
* memory leak fix

# v1.1.0

* added `destroy()` for single page apps

# v1.0.0

* v1 release 🎉
* adds unit tests
