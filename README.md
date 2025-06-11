# Visual Span Test

An implementation of the Visual Span Test with letter box settings and logging capabilities.

## General information
Reading speed is majorly affected by readers' visual span, i.e., the amount of visual information that can be processed and recognised in a single glance or fixation. It is often measured as the number of letters or characters that can be identified without moving the eyes.  Skilled readers typically have a larger visual span, which helps them process words faster. 

## Installation
[Download](https://github.com/Til-D/visual_span/archive/master.zip) the ZIP file, unzip it, install node, express, and other dependencies specified in the package.json, fire up the express server and navigate to localhost.

For detailed instruction on how to install express, go to [https://expressjs.com/](https://expressjs.com/)

## Visual Span Tasks Settings 

### via code parameters in default.js
in [default.js](https://github.com/Til-D/visual_span/blob/main/server/public/javascripts/default.js):
- TRIGRAM_SPEED: duration in milliseconds a trigram is shown
- TRIGRAM_POSITIONS: positions (block letter spaces) in front (positive) or behind (negative) the trigram effectively shifting it along the x-axis
- TRIGRAM_TRIALS: number of trigrams shown per position
- TRIALS_PER_ROUND: defines one round of trials before participant can take a break

### via css parameters in style.css
in [style.css](https://github.com/Til-D/visual_span/blob/main/server/public/stylesheets/style.css):
- #text_canvas 
    - font-size: It is best to know the DPI of your target screen or printer, then you can convert dots to pixels: 12 dots at 96 DPI: 1 dot = 1 pixel at 96 DPI.

## Author
- [Tilman Dingler](https://github.com/Til-D/)

## Used libraries and utilities
- [jQuery](http://jquery.com/) ([MIT license](https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt))
- [jQuery UI](http://jqueryui.com/) ([MIT license](http://www.opensource.org/licenses/mit-license) or [GPL v2](http://opensource.org/licenses/GPL-2.0))
- [express](https://expressjs.com/) ([Creative Commons](https://creativecommons.org/licenses/by-sa/3.0/us/))

## License
This Stroop Test implementation is published under the [MIT license](http://www.opensource.org/licenses/mit-license) and [GPL v3](http://opensource.org/licenses/GPL-3.0).