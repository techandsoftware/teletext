<!--
SPDX-FileCopyrightText: © 2026 Rob Hardy
SPDX-License-Identifier: AGPL-3.0-only
-->

![Splash: Prerendered teletext page](https://teletext-for-javascript-docs.robdev.org.uk/assets/teletext_prerendered_splash.svg)

This package renders teletext pages using vector graphics (SVG). 

* Rich API to draw text and graphics
* Support for teletext level 1, 1.5 and parts of 2.5
* Scalable, high-resolution rendering

Quickstart with CDN:

```html
<div id="teletextscreen"></div>

<script type="module">
  import { Teletext } from 'https://cdn.jsdelivr.net/npm/@techandsoftware/teletext@latest/dist/teletext.min.js';

  const teletext = Teletext();
  teletext.addTo('#teletextscreen');
  teletext.setRow(0, 'Hello world!');
</script>
```

For local development, install the module and import the following if you're using vite or similar tooling:

```javascript
import { Teletext } from '@techandsoftware/teletext';
```

It can also be run in nodejs, see the API.

# Docs

* [Full documentation](https://teletext-for-javascript-docs.robdev.org.uk/)
  * [Usage](https://teletext-for-javascript-docs.robdev.org.uk/teletext-usage.html)
  * [API](https://teletext-for-javascript-docs.robdev.org.uk/teletext-screen-api.html)
  * [Demos](https://teletext-for-javascript-docs.robdev.org.uk/demos/)

# License

The project is licensed under GNU Affero General Public License 3 [AGPL-3.0-only](https://www.gnu.org/licenses/agpl-3.0.en.html). For commercial support and integration enquiries, contact <techandsoftwareltd@outlook.com>.

The fonts supplied in the `demo/fonts` directory have their own licenses. See the `*.license` files in that directory.

This package is compliant with [REUSE 3](https://reuse.software/).

# Credits

* Unscii font used for block graphics when `setView` or `enhance().putG3()` is called - http://viznut.fi/unscii/
* Native font stack adapted from Bootstrap's - https://getbootstrap.com/docs/4.5/content/reboot/#native-font-stack
* The internal API used for drawing SVG is a subset of svg.js v3 - https://svgjs.dev/docs/3.0/
* Teletext test pages from https://teletextarchive.com/
* The data format for stored test pages and for the `loadPageFromEncodedString` API is from Simon Rawles' teletext editor - https://edit.tf/
* The Output Line format is taken from MRG's .tti file spec - https://zxnet.co.uk/teletext/documents/ttiformat.pdf
