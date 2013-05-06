var args = arguments[0] || {};

$.thumbnailView.image = args.cover;
$.titleLabel.text     = args.title;
$.subLabel.text       = args.status;
$.row.issueName       = args.name;

if (args.showProgress) {
    $.progressBar.show();
} else {
    $.subLabel.opacity = 1;
}

exports.updateProgress = function(progress) {
    $.progressBar.value = progress;
}
