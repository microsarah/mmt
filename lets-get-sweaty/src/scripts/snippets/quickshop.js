/**
 * Quickshop Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Quickshop snippet.
 *
   * @namespace quickshop
 */

 theme.Quickshop = (function(){

    // Define data-attribute selectors for the quickshop DOM element(s);
    var selectors = {
        comparePrice: '[data-compare-price]',
        comparePriceText: '[data-compare-text]',
        originalSelectorId: '[data-product-select]',
        productJson: '[data-product-json]',
        productPrice: '[data-product-price]',
        quantity: 'input#Quantity',
        quickAddToCart: '[data-quickadd-to-cart]',
        singleOptionSelectorQuickshop: '[data-single-option-selector-quickshop]',
        quickshopFlashMessage: '[data-quickshop-flash-message]',
        quickshopFlashMessageText: '[data-quickshop-flash-message-text]',
    };

    /**
     * Quickshop section constructor.
     * @param {string} container - selector for the section container DOM element
     */
    function Quickshop(container){
        this.$container = $(container);
        this.id = this.$container.attr('data-quickshop-product-id');
        this.productSingleObject = JSON.parse($(selectors.productJson, this.$container).html());

        var options = {
            $container : this.$container,
            product: this.productSingleObject,
            singleOptionSelectorQuick: selectors.singleOptionSelectorQuickshop,
            originalSelectorId: selectors.originalSelectorId,
            enableHistoryState: this.$container.data('enable-history-state') || false,
        }

        this.settings = {
            imageSize : slate.Image.imageSize($('img[data-collection-product-image]').attr('src')),
        };
        this.namespace = '.quickshop';
        this.variants = new slate.Variants(options);

        this.$container.on('variantChange' + this.namespace, this.updateAddToCartState.bind(this));
        this.$container.on('variantPriceChange', this.updateProductPrices.bind(this));
        this.$container.on('variantImageChange' + this.namespace, this.updateProductImage.bind(this));
        this.$container.on('quickProductAddedToCart' + this.namespace, this.addToCart.bind(this));

        $(selectors.quickAddToCart, this.$container).click(this.submitCart.bind(this));

    };

    Quickshop.prototype = $.extend({}, Quickshop.prototype, {

        addToCart: function(evt){
            var self = this;
            $.ajax({
                type: "POST",
                url: '/cart/add.js',
                cache: false,
                data: {
                    quantity : evt.quantity,
                    id: evt.variant.id
                },
                complete: function(xhr, status){
                    if (status === 'error' || !xhr.responseText ) {
                        // TODO ADD NON-SILENT FAILURE OF ADD TO CART
                        flashMessage(false);
                    }

                }
            })

            this.updateCartQuantity();
            this.flashMessage(true)
        },

        submitCart: function(evt){
            evt.preventDefault();
            console.log('submit cart triggered');
            // fetch currently selected variant and quantitiy from scoped input form
            var variant = this.variants.currentVariant;
            var quantity = $(selectors.quantity, this.$container).val();
            // trigger event listener for quickshop add to cart button
            this.$container.trigger({
                type: 'quickProductAddedToCart',
                variant: variant,
                quantity: quantity
            })
        },

        flashMessage: function(success){
            if (!success){
                $(selectors.quickshopFlashMessageText, this.$container).html("Unable to add product to cart.")
            }

            $(selectors.quickshopFlashMessage, this.$container).show();
            var self = this;

            setTimeout(function(){
                $(selectors.quickshopFlashMessage, self.$container).hide();
                self.hideQuickshop();
            }, 1500);
        },

        hideQuickshop: function() {
            $(this.$container).fadeOut("slow");
            $(this.$container).hide();
            return;
        },

        /**
        * Updates the DOM state of the quick add to cart button
        *
        * @param {Object} event
        * @param {boolean} enabled - Decides whether cart is enabled or disabled
        * @param {string} text - Updates the text notification content of the cart
        */
        updateAddToCartState: function(evt) {
          var variant = evt.variant;

          if (variant.available) {
            $(selectors.quickAddToCart, this.$container).prop('disabled', false);
            $(selectors.addToCartText, this.$container).html(theme.strings.addToCart);
          } else {
            $(selectors.quickAddToCart, this.$container).prop('disabled', true);
            $(selectors.addToCartText, this.$container).html(theme.strings.soldOut);
          }
        },

        updateCartQuantity: function(evt){
            // fetch current cart from Shopify
            $.getJSON('/cart.js')
                .done(function(d){
                    if (!d){
                        return;
                    }
                    $("span.cart-item-count").html(d.item_count);
                })
        },

        updateProductImage: function(evt){
            var pid = this.productSingleObject.id;
            var variant = evt.variant;
            var sizedImgUrl = slate.Image.getSizedImageUrl(variant.featured_image.src, this.settings.imageSize);

            $("img[data-collection-product-image='" + pid + "']").attr('src', sizedImgUrl);

        },

        /**
        *    Updates DOM with selected variant product price
        *     @param {Object} event
        *     @param {string} productPrice - Current Price
        *     @param {string} comparePraice - Original Price
        */
        updateProductPrices: function(evt){
            var variant = evt.variant;
            // to back out into the product card and modify always visible price
            var container = this.$container.parent().parent();
            var $comparePrice = $(selectors.comparePrice, container);
            console.log($comparePrice);
            var $compareEls = $comparePrice.add(selectors.comparePriceText, container);

            $(selectors.productPrice, container)
              .html(slate.Currency.formatMoney(variant.price, theme.moneyFormat));

            if (variant.compare_at_price > variant.price) {
              $comparePrice.html(slate.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat));
              $compareEls.removeClass('hide');
            } else {
              $comparePrice.html('');
              $compareEls.addClass('hide');
            }
        },

        /**
        *    Updates DOM with selected variant product price
        *     @param {Object} event
        *     @return {number} quantity - Original Price
        */
        fetchProductQuantity: function(evt){
            var variant = evt.variant;
            var quantity = $('#Quantity').val();

            if (!variant.available) {
                return;
            };

            return quantity;

        },

    });

    return Quickshop;
 })();
