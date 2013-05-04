var cairo = require('builtin/cairo'),
    fs = require('fs'),
    uuid = require('phpjs').uuid;

var surface = cairo.image_surface_create (cairo.FORMAT_ARGB32, 240, 80);
var context = cairo.context_create (surface);

cairo.context_select_font_face (context, "serif", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD);
cairo.context_set_font_size (context, 32.0);
cairo.context_set_source_rgb (context, 0.0, 0.0, 1.0);
cairo.context_move_to (context, 10.0, 50.0);
cairo.context_show_text (context, "Hello, world");

var filename = '/tmp/' + uuid() + '.png';
cairo.context_destroy(context);
cairo.surface_write_to_png(surface, filename);
cairo.surface_destroy(surface);
res.contentType = 'image/png';
res.sendFile(filename);
fs.unlink(filename);
res.stop();
