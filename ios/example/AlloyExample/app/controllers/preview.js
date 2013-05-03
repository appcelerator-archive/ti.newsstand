var args = arguments[0] || {};

$.previewWin.title = args.title || '';
$.webView.url      = Ti.Filesystem.getFile(args.url).nativePath;
