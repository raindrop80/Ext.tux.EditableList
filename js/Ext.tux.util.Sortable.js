//Definition of Sencha Touch UX namespace
Ext.ns('Ext.tux', 'Ext.tux.util');

/**
 * @author Andrea Cammarata.
 * @link http://www.andreacammarata.com
 * @class Ext.tux.util.Sortable
*/
Ext.tux.util.Sortable = Ext.extend(Ext.util.Sortable, {
	
	// @private
	onSortStart : function(e, t) {
		this.sorting = true;
		var draggable = new Ext.util.Draggable(t, {
			threshold: 0,
			revert: this.revert,
			direction: this.direction,
			constrain: this.constrain === true ? this.el : this.constrain,
			animationDuration: 100
		});
		draggable.on({
			drag: this.onDrag,
			dragend: this.onDragEnd,
			scope: this
		});

		this.dragEl = t;
		this.calculateBoxes();

		if (!draggable.dragging) {
			draggable.onStart(e);
		}

		// Getting the index of the dragging element before it will be moved
		this.oldIndex = this.el.select(this.itemSelector, false).indexOf(draggable.el.dom);

		// Rising the sortstart event returning the element original index
		this.fireEvent('sortstart', this, e, this.oldIndex);
	},

	// @private
	onDrag : function(draggable, e) {
		var items = this.items,
			ln = items.length,
			region = draggable.region,
			sortChange = false,
			i, intersect, overlap, item;

			for (i = 0; i < ln; i++) {
				item = items[i];
				intersect = region.intersect(item);
				if (intersect) {

					if (this.vertical && Math.abs(intersect.top - intersect.bottom) > (region.bottom - region.top) / 2) {
						if (region.bottom > item.top && item.top > region.top) {
							draggable.el.insertAfter(item.el);
						}
						else {
							draggable.el.insertBefore(item.el);
						}
						sortChange = true;
					}
					else if (this.horizontal && Math.abs(intersect.left - intersect.right) > (region.right - region.left) / 2) {
						if (region.right > item.left && item.left > region.left) {
							draggable.el.insertAfter(item.el);
						}
						else {
							draggable.el.insertBefore(item.el);
						}
						sortChange = true;
					}

					if (sortChange) {
						// We reset the draggable (initializes all the new start values)
						draggable.reset();

						// Move the draggable to its current location (since the transform is now
						// different)
						draggable.moveTo(region.left, region.top);

						// Finally lets recalculate all the items boxes
						this.calculateBoxes();

						// Saving the new element index
						this.newIndex = this.el.select(this.itemSelector, false).indexOf(draggable.el.dom);

						// Rising the sortchange event with the old and new index
						this.fireEvent('sortchange', this, draggable.el, this.oldIndex, this.newIndex);
						return;
					}
				}
			}
	},

	// @private
	onDragEnd : function(draggable, e) {
		draggable.destroy();
		this.sorting = false;

		// Rising the sortend event with the old and new index
		this.fireEvent('sortend', this, draggable, e, this.oldIndex, this.newIndex);
	}
	
});