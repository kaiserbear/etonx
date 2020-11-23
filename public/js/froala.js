froalaEditorStandardButtons = [
    'bold',
    'italic',
    'underline',
    'strikeThrough',
    'subscript',
    'superscript',
    '|',
    'fontFamily',
    'fontSize',
    'color',
    'inlineStyle',
    'paragraphStyle',
    '|',
    'paragraphFormat',
    'align',
    'formatOL',
    'formatUL',
    'outdent',
    'indent',
    'quote',
    '-',
    'insertLink',
    'insertImage',
    'lightbox',
    // 'viewS3',
    'insertVideo',
    'insertFile',
    'insertTable',
    '|',
    'insertHR', 'selectAll', 'clearFormatting', '|', 'html', '|', 'undo', 'redo', '|', 'help'
]

// Initiate Froala Editor

function froala() {
    if ($('.froala').length) {

        $.get('/upload_image', {})
            .done(function(s3Hash) {


                $('.froala').froalaEditor({
                    toolbarButtons: froalaEditorStandardButtons,
                    iconsTemplate: 'font_awesome_5',
                    quickInsertTags: [''],
                    // Set the image upload URL.
                    imageManagerLoadURL: location.origin + '/get_bucket_list',
                    imageStyles: {
                        lightbox: 'Lightbox'
                    },
                    imageUploadURL: false,
                    videoUploadURL: false,
                    fileUploadURL: false,
                    imageUploadToS3: s3Hash,
                    videoUploadToS3: s3Hash,
                    imageManager: false,
                    fileUploadToS3: s3Hash,
                    imageAllowedTypes: ['jpeg', 'jpg', 'png', 'gif', 'svg+xml'],
                    fileAllowedTypes: ['jpeg', 'jpg', 'png', 'sketch', 'pdf', 'gif', 'svg+xml'],
                    key: 'mA4A3E4E1vA1E1I1A1B8C7A5E1F5A4iH-7B-21vC-13F-11cG3yH-8lifl=='
                });
            });
    }
}

$(function() {
    froala();
});