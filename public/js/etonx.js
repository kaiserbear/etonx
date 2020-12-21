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
    })

}

const $checkForm = $("#check-form");
const $purchaseForm = $("#purchase-form");
const $registerForm = $("#register-form");

function checkPurchaseUser() {

    $("#who_am_i").on('change', function() {
        if (this.value === "student") {
            $("#user-type").hide();
        } else if (this.value === "teacher") {
            $("#user-type").text('student\'s').show();
        } else if (this.value === "parent") {
            $("#user-type").text('child\'s').show();
        }
    });
}

function validation() {


    // Errors as tooltips

    $('#check-form input[type="text"]').tooltipster({
        trigger: 'custom', // default is 'hover' which is no good here
        onlyOne: false, // allow multiple tips to be open at a time
        position: 'top' // display the tips to the right of the element
    });

    $('#purchase-form input[type="text"]').tooltipster({
        trigger: 'custom', // default is 'hover' which is no good here
        onlyOne: false, // allow multiple tips to be open at a time
        position: 'top' // display the tips to the right of the element
    });


    $('#register-form input').tooltipster({
        trigger: 'custom', // default is 'hover' which is no good here
        onlyOne: false, // allow multiple tips to be open at a time
        position: 'top' // display the tips to the right of the element
    });

    $('#register-form input[type="password"]').tooltipster({
        trigger: 'custom', // default is 'hover' which is no good here
        onlyOne: false, // allow multiple tips to be open at a time
        position: 'top' // display the tips to the right of the element
    });

    // To Tidy up

    $checkForm.validate({
        errorPlacement: function(error, element) {
            $(element).tooltipster('update', $(error).text());
            $(element).tooltipster('show');
        },
        success: function(label, element) {
            console.log('success');
            $(element).tooltipster('hide');
        },
        rules: {
            // simple rule, converted to {required:true}
            studentDob: "required"
        },
        messages: {
            studentDob: "We need to check the age of the student taking this course for safeguarding reasons."
        }
    });


    $purchaseForm.validate({
        errorPlacement: function(error, element) {
            $(element).tooltipster('update', $(error).text());
            $(element).tooltipster('show');
        },
        success: function(label, element) {
            $(element).tooltipster('hide');
        },
        rules: {
            name_on_card: "required",
            card_number: {
                required: true,
                creditcard: true,
                minlength: 13,
                maxlength: 16,
                digits: true,
            },
            expiry: "required",
            email1: {
                required: true,
                email: true
            },
            email2: {
                required: true,
                email: true,
                equalTo: '#email1'
            }
        },
        messages: {
            name_on_card: "We need the name as is printed on your card",
            cardnumber: {
                required: "Please enter a valid credit card number",
                minlength: "Please enter a valid credit card number",
                maxlength: "Please enter a valid credit card number",
                digits: "Your credit card number cannot contain spaces.",
                CCNumber: "WRONG"
            },
            expiry: "We need a valid date here",
            email1: {
                required: "We need an email to send the receipt to",
                email: "This has to be a valid email"
            },
            email2: {
                required: "We need you to confirm your email address",
                email: "This has to be a valid email",
                equalTo: "Your emails don't match"
            }
        }
    });

    $registerForm.validate({
        errorPlacement: function(error, element) {
            $(element).tooltipster('update', $(error).text());
            $(element).tooltipster('show');
        },
        success: function(label, element) {
            $(element).tooltipster('hide');
        },
        rules: {
            username: {
                required: true,
                email: true
            },
            email2: {
                required: true,
                email: true,
                equalTo: '#email1'
            },
            firstName: "required",
            lastName: "required",
            password1: {
                minlength: 5,
                required: true
            },
            password2: {
                equalTo: "#password1",
                required: true
            }
        },
        messages: {
            username: {
                required: "We need an email to send the receipt to",
                email: "This has to be a valid email"
            },
            email2: {
                required: "We need you to confirm your email address",
                email: "This has to be a valid email",
                equalTo: "Your emails don't match"
            },
            firstName: "We need to capture a recognised first name",
            lastName: "We need to capture a recognised last name",
            password1: {
                minlength: "Sorry the password needs to be at least 5 characters"
            },
            password2: {
                equalTo: "Sorry the passwords do not match"
            }
        }
    });
}

function courseTypes() {
    $("#tabs").tabs({
        activate: function(event, ui) {
            var active = $('#tabs').tabs('option', 'active');
            $("#tabid").html('the tab id is ' + $("#tabs ul>li a").eq(active).attr("href"));

        }
    });
}

function etonXinit() {

    console.log('check');

    customTabs();
    $('.tooltip').tooltipster();
    $("#datepicker").datepicker({
        changeMonth: true,
        changeYear: true,
        yearRange: '2000:2007',
        dateFormat: 'dd/mm/yy'
    });
    $("#country_selector").countrySelect({
        preferredCountries: ['gb', 'us']
    });

    checkPurchaseUser();
    validation();
    courseTypes();

    // function callTypeForm() {
    //     $("body a:last-child").click()

    // }
    // callTypeForm();
}

etonXinit();