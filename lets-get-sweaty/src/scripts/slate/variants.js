/**
 * Variant Selection scripts
 * ------------------------------------------------------------------------------
 *
 * Handles change events from the variant inputs in any `cart/add` forms that may
 * exist. Also updates the master select and triggers updates when the variants
 * price or image changes.
 *
 * @namespace variants
 */

slate.Variants = (function() {

  /**
   * Variant constructor
   *
   * @param {object} options - Settings from `product.js`
   */
  function Variants(options) {
    this.$container = options.$container;
    this.product = options.product;
    this.singleOptionSelector = options.singleOptionSelector;
    this.originalSelectorId = options.originalSelectorId;
    this.enableHistoryState = options.enableHistoryState;
    this.currentVariant = this._getVariantFromOptions();
    this.productThumbs = options.productThumbs;
    this.productFeaturedImage = options.productFeaturedImage;
    this.productVariantImage = options.productVariantImage;

    $(this.singleOptionSelector, this.$container).on('change', this._onSelectChange.bind(this));

    // triggers _onImageSelectChange to change currently selected product
    $(this.productThumbs, this.$container).on('click', this._onImageSelectChange.bind(this));
  }

  Variants.prototype = $.extend({}, Variants.prototype, {

    /**
     * Get the currently selected options from add-to-cart form. Works with all
     * form input elements.
     *
     * @return {array} options - Values of currently selected variants
     */
    _getCurrentOptions: function() {
      var currentOptions = $.map($(this.singleOptionSelector, this.$container), function(element) {
        var $element = $(element);
        var type = $element.attr('type');
        var currentOption = {};

        if (type === 'radio' || type === 'checkbox') {
          if ($element[0].checked) {
            currentOption.value = $element.val();
            currentOption.index = $element.data('index');

            return currentOption;
          } else {
            return false;
          }
        } else {
          currentOption.value = $element.val();
          currentOption.index = $element.data('index');

          return currentOption;
        }
      });

      // remove any unchecked input values if using radio buttons or checkboxes
      currentOptions = slate.utils.compact(currentOptions);

      return currentOptions;
    },

    /**
     * Find variant based on selected values.
     *
     * @param  {array} selectedValues - Values of variant inputs
     * @return {object || undefined} found - Variant object from product.variants
     */
    _getVariantFromOptions: function() {
      var selectedValues = this._getCurrentOptions();
      var variants = this.product.variants;
      var found = false;

      variants.forEach(function(variant) {
        var satisfied = true;

        selectedValues.forEach(function(option) {
          if (satisfied) {
            satisfied = (option.value === variant[option.index]);
          }
        });

        if (satisfied) {
          found = variant;
        }
      });

      return found || null;
    },

    /**
     * _onImageSelectChange - Event handler for when a variant changes based on image click.
     *
     * @param  {integer} selectedVariantIndex index of clicked product thumbnail
     */
    _onImageSelectChange: function(evt) {
        evt.preventDefault();
        var selectedVariantIndex = evt.target.parentNode.parentNode.getAttribute('data-product-variant');

        // if there's more than one varaint, update the selected product
        if (this.product.variants.length > 1){

            // hard fix for migrator kit (multiple images per single variant)
            if (this.product.id === 161963617 ){
                // get url of replacement image image BEFORE manually changing variant index as to correspond with order of variants in dropdown.
                var newFeaturedImageUrl = $("li"+this.productVariantImage)[selectedVariantIndex].childNodes[1].href;
                if (selectedVariantIndex < 2) {
                    selectedVariantIndex = 0;
                } else if (selectedVariantIndex > 1) {
                    selectedVariantIndex = 1;
                };
            }

            // grab variant by index via image selected after check for migrator kit as selected product
            var variant = this.product.variants[selectedVariantIndex];;
            if (!variant || variant ==='undefined') {
                return;
            }
            // set dropdown menu to index of selected image
            $(this.singleOptionSelector)[0].selectedIndex = selectedVariantIndex;
            // trigger the event
            this.$container.trigger({
                type: 'variantChange',
                variant: variant
            });
            this._onSelectChange();

            // !!! set image AFTER this._onSelectChange() as to override selection of variant base image !!!
            // sets src of product featured image to clicked
            $(this.productFeaturedImage).attr('src', newFeaturedImageUrl);
        }
        // if there's only one variant, just change the featured image but not the variant selected
        else {
                                                // vvvv A cleaner way....? vvvv
            var newFeaturedImageUrl = $("li"+this.productVariantImage)[selectedVariantIndex].childNodes[1].href;
            // sets src of product featured image to clicked
            $(this.productFeaturedImage).attr('src', newFeaturedImageUrl);
        }
    },

    /**
     * Event handler for when a variant input changes.
     */
    _onSelectChange: function() {
      var variant = this._getVariantFromOptions();

      this.$container.trigger({
        type: 'variantChange',
        variant: variant
      });

      if (!variant) {
        return;
      }

      this._updateMasterSelect(variant);
      this._updateImages(variant);
      this._updatePrice(variant);
      this._updateDescription(variant);
      this.currentVariant = variant;

      if (this.enableHistoryState) {
        this._updateHistoryState(variant);
      }
    },

    _updateDescription: function(variant){

        this.$container.trigger({
            type: 'variantDescriptionChange',
            variant: variant
        })
    },

    /**
     * Trigger event when variant image changes
     *
     * @param  {object} variant - Currently selected variant
     * @return {event}  variantImageChange
     */
    _updateImages: function(variant) {
      var variantImage = variant.featured_image || {};
      var currentVariantImage = this.currentVariant.featured_image || {};

      if (!variant.featured_image || variantImage.src === currentVariantImage.src) {
        return;
      }

      this.$container.trigger({
        type: 'variantImageChange',
        variant: variant
      });
    },

    /**
     * Trigger event when variant price changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantPriceChange
     */
    _updatePrice: function(variant) {
      if (variant.price === this.currentVariant.price && variant.compare_at_price === this.currentVariant.compare_at_price) {
        return;
      }

      this.$container.trigger({
        type: 'variantPriceChange',
        variant: variant
      });
    },

    /**
     * Update history state for product deeplinking
     *
     * @param {object} variant - Currently selected variant
     */
    _updateHistoryState: function(variant) {
      if (!history.replaceState || !variant) {
        return;
      }

      var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
      window.history.replaceState({path: newurl}, '', newurl);
    },

    /**
     * Update hidden master select of variant change
     *
     * @param {object} variant - Currently selected variant
     */
    _updateMasterSelect: function(variant) {
      $(this.originalSelectorId, this.$container)[0].value = variant.id;
    }
  });

  return Variants;
})();
