function customTabs() {
    var $coursesTabs = $("#courses ul li a").not('#showAll');
    var $course = $('.course');
    $coursesTabs.on("click", function() {
        var toggleClass = $(this).attr("data-toggle");

        // Tab class
        $coursesTabs.removeClass('active');
        $(this).addClass('active');

        $course.removeClass('hide');
        $course.not('.' + toggleClass).addClass('hide');
    });

    $('#showAll').on("click", function() {
        $coursesTabs.removeClass('active');
        $course.removeClass('hide');
    });


}

function init() {
    customTabs();
    $('.tooltip').tooltipster();
}

init();