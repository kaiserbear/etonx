const fakeNav = document.getElementById("fake-nav");
const primaryNav = document.getElementById('primaryNav');
const mainEl = document.getElementById('main');
const adminEl = document.getElementById('admin');
const contentEl = document.getElementsByClassName('main-content-container')[0];
const sideBar = document.getElementById('sidebar');
var lastScroll = 0;
var pathHash = window.location.hash;
var pageScrollTimer = null;


function fadeOnHoverMenuItem() {
    $('ul.nav li.dropdown').hover(function() {
        $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
    }, function() {
        $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
    });
}

function scrollToSection() {

    $('.page-link').click(function() {

        var $sectionId = $(this).data('section');

        if (typeof $sectionId === 'undefined') {
            return;
        } else if ($sectionId === "overview") {
            $([document.documentElement, document.body]).animate({
                scrollTop: 0
            }, 500);
        } else {
            $([document.documentElement, document.body]).animate({
                scrollTop: $('#' + $sectionId).offset().top + 10
            }, 500);
        }
    });
}

function navScroll() {

    var currentScroll = document.documentElement.scrollTop || document.body.scrollTop; // Get Current Scroll Value

    if (currentScroll > 0 && lastScroll <= currentScroll) {
        lastScroll = currentScroll;
        primaryNav.classList.remove("sticky", "animated", "fadeInDown");
        primaryNav.classList.add("fadeOut");
        fakeNav.style = "display: none;"
    } else {
        lastScroll = currentScroll;
        primaryNav.classList.add("sticky", "animated", "fadeInDown");
        primaryNav.classList.remove("fadeOut");
        fakeNav.style = "display: block;"
    }

}

function fadeOutFAlert() {
    if ($('.alert')) {
        setTimeout(function() {
            $('.alert').fadeOut('fast');
        }, 3000); // <-- time in milliseconds
    }
}

function codeMrr() {

    var codeMirrorElement = document.getElementsByClassName("code-codemirror");

    function buildCm(element, cmType) {
        cmElement = CodeMirror.fromTextArea(element, {
            mode: "text/" + cmType,
            lineNumbers: true,
            lineWrapping: true,
            autoRefresh: true,
            theme: 'base16-light',
            gutter: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete"
            }
        });

        // Check if needs to be readonly

        if (element.classList.contains('read-only')) {
            cmElement.setOption('readOnly', true);
        }
    }


    function initCm() {
        if (codeMirrorElement && mainEl) {
            for (var i = 0; i < codeMirrorElement.length; i++) {
                var cmType = codeMirrorElement[i].dataset.type;
                buildCm(codeMirrorElement[i], cmType);
            }
        }
    }

    return initCm();

}

function currentYPosition() {
    // Firefox, Chrome, Opera, Safari
    if (self.pageYOffset) return self.pageYOffset;
    // Internet Explorer 6 - standards mode
    if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop;
    // Internet Explorer 6, 7 and 8
    if (document.body.scrollTop) return document.body.scrollTop;
    return 0;
}

function elmYPosition(eID) {
    var elm = document.getElementById(eID);
    var y = elm.offsetTop;
    var node = elm;
    while (node.offsetParent && node.offsetParent != document.body) {
        node = node.offsetParent;
        y += node.offsetTop;
    }
    return y;
}

function smoothScroll(eID) {
    var startY = currentYPosition();
    var stopY = elmYPosition(eID);
    var distance = stopY > startY ? stopY - startY : startY - stopY;
    if (distance < 100) {
        scrollTo(0, stopY);
        return;
    }
    var speed = Math.round(distance / 100);
    if (speed >= 10) speed = 10;
    var step = Math.round(distance / 25);
    var leapY = stopY > startY ? startY + step : startY - step;
    var timer = 0;
    if (stopY > startY) {
        for (var i = startY; i < stopY; i += step) {
            setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
            leapY += step;
            if (leapY > stopY) leapY = stopY;
            timer++;
        }
        return;
    }
    for (var i = startY; i > stopY; i -= step) {
        setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
        leapY -= step;
        if (leapY < stopY) leapY = stopY;
        timer++;
    }
    return false;
}

function pageMenuScroll() {

    const pageScroll = document.getElementById("sideNav");

    if (pageScroll) {

        var pageScroll_Rec = pageScroll.getBoundingClientRect();
        var pageHead = document.getElementById('page--heading');
        var pageContent = document.getElementById('page--content');

        function reset() {
            pageScroll.classList.remove("sticky", "sticky-bottom");
            // pageScroll.style.width = "inherit";
        }

        // reset();

        // The header on the page - get the height
        var pageHeadHeight = pageHead.getBoundingClientRect().height;

        // Get the height from the navigation
        var navHeight = primaryNav.getBoundingClientRect().height;

        // Get the padding from the main page content
        var pageSectionPadding = getStyle(pageContent, "padding-top");


        applyFromTop = (pageHeadHeight + parseInt(pageSectionPadding)) - 20;

        var capH = pageScroll.childNodes[1].offsetHeight;
        var footH = footer.offsetHeight;
        var bodPadd = parseInt(pageSectionPadding);
        var docH = document.documentElement.scrollHeight;
        var tRem = capH + footH + bodPadd;
        var bottom = footH + capH;

        applyFromBottom = docH - (tRem + 83);

        if (window.pageYOffset >= applyFromTop && window.pageYOffset < applyFromBottom) {
            pageScroll.classList.remove("sticky-bottom");
            pageScroll.classList.add("sticky");
            pageScroll.style.width = "175px";
        } else if (window.pageYOffset >= applyFromBottom) {
            pageScroll.classList.remove("sticky");
            pageScroll.classList.add("sticky-bottom");
        } else {
            reset();
        }


    }

    function getStyle(oElm, strCssRule) {
        var strValue = "";
        if (document.defaultView && document.defaultView.getComputedStyle) {
            strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
        } else if (oElm.currentStyle) {
            strCssRule = strCssRule.replace(/\-(\w)/g, function(strMatch, p1) {
                return p1.toUpperCase();
            });
            strValue = oElm.currentStyle[strCssRule];
        }
        return strValue;
    }
}


function init() {
    fadeOutFAlert();
    $('.tooltip').tooltipster();
    fadeOnHoverMenuItem();
}

init();