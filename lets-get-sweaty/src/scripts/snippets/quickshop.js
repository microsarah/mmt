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
        singleOptionSelectorQuickshop: '[data-single-option-selector-quickshop]',
        productFeaturedImageQuickshop: '[data-collection-product-image]',
        productPrice: '[data-product-price]',
        quickAddToCart: '[data-quickadd-to-cart]',
    };

    /**
     * Quickshop section constructor.
     * @param {string} container - selector for the section container DOM element
     */
    function Quickshop(container){
        this.$container = $(container);
        this.id = this.$container.attr('data-quickshop-product-id');

        var options = {
            $container : this.$container,
            enableHistoryState: this.$container.data('enable-history-state') || false,
            singleOptionSelector: selectors.singleOptionSelectorQuickshop,
            originalSelectorId: selectors.originalSelectorId,
            product: this.productSingleObject,
            productThumbs: selectors.productThumbs,
            productFeaturedImage: selectors.productFeaturedImage,
            productVariantImage: selectors.productVariantImage,
        }

        this.namespace = '.quickshop';
        // this.variants = new slate.Variants(options);

    };

    Quickshop.prototype = $.extend({}, Quickshop.prototype, {

    });

    return Quickshop;
 })();
