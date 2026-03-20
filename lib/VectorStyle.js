// SPDX-FileCopyrightText: © 2026 Rob Hardy
// SPDX-License-Identifier: AGPL-3.0-only

// .mosaic class font size - FUDGE bigger than 10px to close tiny gaps vertically */

const VECTOR_STYLE = `@font-face {
font-family: 'Unscii';
src: url('fonts/unscii-16.woff') format('woff'), 
url('fonts/unscii-16.ttf') format('truetype'),
url('fonts/unscii-16.otf') format('opentype');
unicode-range: U+0000-00FF, U+2022, U+2500, U+2502, U+250C, U+2510, U+2514, U+2518, U+251C, U+251D, U+2524, U+2525, U+252C, U+252F, U+2534, U+2537, U+253C, U+253F, U+2588, U+258C, U+2590, U+2592, U+25CB, U+25CF, U+25E2-25E5, U+2B60-2B63, U+E0C0-E0FF, U+1FB00-1FB70, U+1FB75, U+1FBA0-1FBA7;
-webkit-font-smoothing: none;
font-smooth: never;
}
@font-face {
font-family: 'Bedstead';
src: url('fonts/bedstead.otf') format('opentype');
unicode-range: U+0000-00FF;
}
@keyframes blink {
to {
visibility: hidden;
}
}
@keyframes fancyblink {
from {
filter: none;
opacity: 0.7;
}
33% {
filter: none;
opacity: 1;
}
66% {
filter: blur(0px);
opacity: 1;
}
95% {
filter: blur(4px);
opacity: 0;
}
to {
filter: blur(0px);
opacity: 0;
}
}
#textlayer {
font-size: 10px;
}
.mosaic {
font-family: 'Unscii';
font-size: 10.3px;
}
.mosaic_separated {
font-family: 'Unscii';
font-size: 10px;
}
.flash_flashing .flash {
/* animation: blink 2s steps(3, start) infinite; */
animation: fancyblink 2s linear infinite;
}
.conceal_concealed  .conceal {
visibility: hidden;
}
svg #background {
transition-property: opacity;
transition-duration: 0.25s;
}
svg {
background-color: transparent;
}
svg use {
shape-rendering: crispEdges;
}
rect { color: orange; }
`;

export default VECTOR_STYLE;
