# CNN Smooth Scroll bundle attribution

The local `smooth-scroll-15.2.1.polyfills.min.js` is the unmodified minified distribution at [Smooth Scroll commit `82de06c`](https://github.com/cferdinandi/smooth-scroll/tree/82de06c95c51b3b7b484d88b92da712812738f60). Its retained header identifies Smooth Scroll 15.2.1, © 2019 Chris Ferdinandi and MIT; the repository's [license text](cnn-smooth-scroll-15.2.1.LICENSE) identifies Go Make Things, LLC.

The corresponding [unminified distribution](https://github.com/cferdinandi/smooth-scroll/blob/82de06c95c51b3b7b484d88b92da712812738f60/dist/smooth-scroll.polyfills.js) names the following sources in comments that the minified file does not retain:

- `closest()` and `CustomEvent()` polyfills link to MDN's respective API documentation. MDN's [licensing guidance](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Attrib_copyright_license) distinguishes code samples by their date of addition; the precise historical versions of those samples have not been established here.
- The `requestAnimationFrame()` polyfill credits Erik Möller and fixes from Paul Irish and Tino Zijdel, links to their published material, and marks the polyfill MIT in its source comment.
- The CSS identifier escaping helper credits Mathias Bynens and links to [CSS.escape](https://github.com/mathiasbynens/CSS.escape). The [upstream MIT license](cnn-css-escape.LICENSE) is retained as an additional notice; the helper is adapted rather than a verified byte-for-byte copy of that repository.

These notes preserve the source's attributions and record evidence limitations; they are not a comprehensive audit of every historical contribution to the distribution.
