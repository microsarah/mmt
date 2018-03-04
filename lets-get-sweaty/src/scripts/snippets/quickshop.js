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
        productFeaturedImageQuickshop: '[data-collection-product-image]',
        productJson: '[data-product-json]',
        productPrice: '[data-product-price]',
        quickAddToCart: '[data-quickadd-to-cart]',
        singleOptionSelectorQuickshop: '[data-single-option-selector-quickshop]',
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
            singleOptionSelector: selectors.singleOptionSelectorQuickshop,
            originalSelectorId: selectors.originalSelectorId,
            enableHistoryState: this.$container.data('enable-history-state') || false,
            singleOptionSelector: selectors.singleOptionSelectorQuickshop,
            productFeaturedImage: selectors.productFeaturedImage, // get from parent obj
            // productVariantImage: selectors.productVariantImage,
        }

        this.namespace = '.quickshop';
        this.variants = new slate.Variants(options);

        this.$container.on('variantChange' + this.namespace, this.updateAddToCartState.bind(this));

    };

    Quickshop.prototype = $.extend({}, Quickshop.prototype, {

        /**
        * Updates the DOM state of the quick add to cart button
        *
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

        /**
        *    Updates DOM with selected variant product price
        *     @param {string} productPrice - Current Price
        *     @param {string} comparePraice - Original Price
        */
        updateProductPrices: function(evt){
            var variant = evt.variant;
            var $comparePrice = $(selectors.comparePrice, this.$container);
            var $compareEls = $comparePrice.add(selectors.comparePriceText, this.$container);
        },

    });

    return Quickshop;
 })();
