if (typeof Shopify.getCart === "undefined" || typeof Shopify.getCart === undefined) {
    Shopify.getCart = function (t) {
        jQuery.getJSON("/cart.js", function (r) {
            if ("function" == typeof t)
                t(r);
        })
    };
}

if (typeof Shopify.clear === "undefined" || typeof Shopify.clear === undefined) {
    Shopify.clear = function (t) {
        var r = {
            type: "POST",
            url: "/cart/clear.js",
            data: "",
            dataType: "json",
            success: function (r) {
                t(r);
            },
            error: function (t, r) {
                Shopify.onError(t, r);
            }
        };
        jQuery.ajax(r);
    };
}

$(function () {
    if (!$.fn.on) {
        $.fn.on = function (events, selector, callback) {
            $(document).delegate(selector, events, callback);
        }
    }

    function createOrder(customerId, address, $submit, cartData) {
        var shippingAddress = {};

        if ($('.submit-address').length) {
            $('.submit-address').find('[name^="address"]').each(function () {
                shippingAddress[this.name.replace('address[', '').replace(']', '')] = this.value;
            });
        }

        cartData.discount = '';
        if ($('#discount').val()) {
            cartData.discount = $('#discount').val();
        }

        $.ajax("/apps/create-order", {
            type: "post",
            dataType: "json",
            crossDomain: true,
            data: {
                customer: customerId,
                address: address,
                cart: cartData,
                shipping_address: shippingAddress
            },
            beforeSend: function (xhr) {
                $('.trade-orders-checkout-btn').html('LOADING...');
            },
            success: function (data) {
                if (data.success) {
                    Shopify.clear(function () {
                        show_popup();
                        //window.location.href = "/pages/"+storeArguments.handle+"-thankyou";
                    });
                } else {
                    $submit.removeClass("disabled");
                    alert(data.error);
                }
            },
            error: function () {
                $submit.removeClass("disabled");
                alert("An error occurred creating the order, please try again.");
            },
            complete: function (){
                $('.trade-orders-checkout-btn').html('PLACE ORDER');
            }
        });
    }

    function handleCheckout(e) {
        e.preventDefault();
        var $self = $(this);

        if (!$self.hasClass("disabled")) {
            $self.addClass("disabled");
            Shopify.getCart(function (data) {
                if (!data.items.length) {
                    $self.removeClass("disabled");
                    alert("There are no items in the cart");
                } else {
                    // temp fix until we know everyone has installed the new confirmation page
                    $.ajax({
                        type: 'HEAD',
                        url: '/pages/ck_checkout',
                        success: function () {
                            if ($self.hasClass('trade-orders-checkout-btn')) {
                                if ($('[name="note"]').length)
                                    data['note'] = $('[name="note"]').val();
                                createOrder(storeArguments.customer, storeArguments.shopAddress, $self, data);
                            } else {
                                window.location.href = "/pages/ck_checkout";
                            }
                        },
                        error: function () {
                            // page does not exist
                            if ($('[name="note"]').length)
                                data['note'] = $('[name="note"]').val();
                            createOrder(storeArguments.customer, storeArguments.shopAddress, $self, data);
                        }
                    });
                }
            });
        }
    }

    function getTypeData() {
        var $discountHolder = $('#trade-orders-discount');
        var total = $discountHolder.data('total');
        var currency = $discountHolder.data('currency');
        var address = '';

        $.ajax(storeArguments.url + "/get_customer_type_data", {
            type: "get",
            dataType: "jsonp",
            data: {
                customer: storeArguments.customer,
                address: storeArguments.shopAddress,
                total: total
            },
            success: function (data) {
                if (!data.discount)
                    data.discount = 0;

                $discountHolder.text((+data.discount).toFixed(2));
                $('[data-value="total"]').text(currency + (total - data.discount).toFixed(2));

                if (data.shipping_name) {
                    if (!data.shipping_price)
                        data.shipping_price = 0;
                    if (!data.tax_price)
                        data.tax_price = 0;
                    $('#trade-orders-shipping-name').text(data.shipping_name);
                    $('#trade-orders-shipping-price').text((+data.shipping_price).toFixed(2));
                    $('#trade-orders-tax-price').text((+data.tax_price).toFixed(2));
                    $('[data-value="total"]').text(currency + (total - (+data.discount) + (+data.shipping_price) + (+data.tax_price)).toFixed(2));
                    $('#trade-orders-shipping').show();
                } else if (data.tax_price) {
                    $('#trade-orders-tax-price').text((+data.tax_price).toFixed(2));
                    $('[data-value="total"]').text(currency + (total - (+data.discount) + (+data.tax_price)).toFixed(2));
                }
            },
            error: function (a, b, c) {
                console.log(a);
                console.log(b);
                console.log(c);
            }
        });
    }

    $(document).on('click', 'a[href="/checkout"]:not(.no-trade-orders)', handleCheckout);
    $(document).on('submit', 'form[action="/checkout"]', handleCheckout);

    $('[onclick="window.location=\'/checkout\'"]').each(function () {
        $(this).removeAttr('onclick');
        $(this).click(handleCheckout);
    });

    // when the cart action is /cart we need to handle submit buttons with the name "checkout"
    var submitName = "";
    $(document).on('submit', 'form[action="/cart"], form#cartform', function (e) {
        if (submitName === "no-trade-orders") {
            $(this).find('[type="submit"], [type="image"]').attr('name', 'checkout');
            $(this).submit();
            return;
        }

        if (submitName === "checkout")
            handleCheckout(e);
    });

    $(document).on('click', 'form[action="/cart"] [type="submit"], form[action="/cart"] [type="image"], form#cartform [type="image"], form#cartform [type="submit"]', function () {
        submitName = this.name;
    });

    if ($('#trade-orders-discount').length) {
        getTypeData();
    }

    $('[data-toggleaddress]').click(function (e) {
        e.preventDefault();

        $('.default-address').toggle();
        $('#address-form').toggle();
    });

    // prevent trade order customers from being redirected to checkout after logging in
    $('#customer_login input[name="checkout_url"]').remove();

    // remove any checkout with paypal buttons if trade orders is active
    $('.additional-checkout-buttons, .additional_checkout_buttons').remove();

});

function show_popup() {
    // Initialize Variables
    var overlay = document.getElementById("overlay");
    var popup = document.getElementById("popup");
    overlay.style.display = 'block';
    popup.style.display = 'block';
}
function hide_popup() {
    // Initialize Variables
    var overlay = document.getElementById("overlay");
    var popup = document.getElementById("popup");
    overlay.style.display = 'none';
    popup.style.display = 'none';
    // similar behavior as clicking on a link
    window.location.href = '/';
}