//Definition of Sencha Touch UX namespace
Ext.ns('Ext.tux');

/**
 * @author Andrea Cammarata
 * @link http://www.andreacammarata.com
 * @class Ext.tux.EditableList
 * @version 0.8.5
 * Copyright(c) 2011 SIMACS company of Andrea Cammarata
*/
Ext.tux.EditableList = Ext.extend(Ext.List, {
	
	//@private
	componentCls: 'x-editable-list',

	/**
	 * @cfg {String} deleteAnimationCls.
	 * Default animation CSS class to apply on deleted items.
	 * Defaults to 'x-list-item-deleted', but you can even choose from:
	 * <ul>
	 * 	 <li>x-list-item-deleted-explode</li>
	 * 	 <li>x-list-item-deleted-black-hole</li>
	 * </ul>
	 */
	deleteAnimationCls: 'x-list-item-deleted',

	/**
	 * @cfg {String} editItemCls.
	 * CSS class to be applied to all the list elements after the list enters
	 * in Edit State. <b>The param will be used only if an {@link #itemEditTpl}
	 * has been provided.</b>
	 */
	editItemCls: '',
	
	/**
	 * @cfg {String} itemEditTpl.
	 * Template to be applied to all the list elements after the list enters
	 * in Edit State.
 	 */
	itemEditTpl: undefined,
	
	/**
	 * @cfg {String} deleteButtonUI.
	 * Custom delete button UI. Defauls to delete.
	 * <b>The param will be used only if the {@link #multiDelete}
	 * will be set to false</b>
	 */
	deleteButtonUI: 'delete',
	
	/**
	 * @cfg {String} deleteButtonText.
	 * Custom delete button Text. Defauls to "Delete".
	 * <b>The param will be used only if the {@link #multiDelete}
	 * will be set to false</b>
	 */
	deleteButtonText: 'Delete',
	
	/**
	 * @cfg {Boolean} allowSort.
	 * True to allow the list elements sorting. Defaults to False.
	 */
	allowSort: false,
	
	/**
	 * @cfg {Boolean} allowSort.
	 * True to allow the multiDelete.
	 */
	multiDelete: false,
	
	//@private
	isEditing: false,
	
	//@private
	isDeleting: false,
	
	//@private
	isSorting: false,
	
	//@private
	deleteSectionCount: 0,

	initComponent: function(){
		
		//Adding a component beta warning message
		console.warn('Ext.tux.EditableList: This component is still in beta version so if you find any bug, please report it writing at the component official Sencha Forum Thread at the url: ' +
			 		 'http://www.sencha.com/forum/showthread.php?144737-Ext.tux.EditableList-Improved-list-component.');
		
		//At the moment the groped property is not supported by the component
		if(this.allowSort){
			if(this.grouped){
				throw new Error('Ext.tux.EditableList: The groped property is not supported by the component at the moment if the list allow elements sorting.');
			}
			if(this.multiDelete){
				throw new Error('Ext.tux.EditableList: The sorting mode is not supported if the list is set in multiDelete mode. This will be fixed in the next component release.');
			}
		}
		
		/* Definition of two variables that will be used to override
		 * the user provided itemTpl and itemEditTpl */
		var tplHtml, params;

		//Check if the component is set to single delete mode
		if(!this.multiDelete){
			
			//Definion of the html template
			tplHtml = '<div class="x-list-left-icon x-icon-delete"></div>' +
					  '<div class="x-list-content">{tpl}</div>' +
					  '<div class="x-button x-button-{deleteButtonUI}">' +
						 '<span class="x-button-label">{deleteButtonText}</span>' +
					  '</div>' +
					  '<tpl if="allowSort">' +
						 '<div class="x-icon-sort"></div>' +
					  '</tpl>';
					
			//Definition of the tpl params
			params = {
				tpl: (Ext.isString(this.itemTpl) ? this.itemTpl : this.itemTpl.html),
				allowSort: this.allowSort,
				deleteButtonUI: this.deleteButtonUI,
				deleteButtonText: this.deleteButtonText
			};
					
		//Otherwise, the component is set to multi delete mode
		}else{
			
			//Definion of the html template
			tplHtml = '<div class="x-list-left-icon x-icon-deselected"></div>' +
					  '<div class="x-list-content">{tpl}</div>' +
					  '<tpl if="allowSort">' +
						 '<div class="x-icon-sort"></div>' +
					  '</tpl>';
			
			//Definition of the tpl params
			params = {
				tpl: (Ext.isString(this.itemTpl) ? this.itemTpl : this.itemTpl.html),
				allowSort: this.allowSort
			};
			
		}
		
		//Definition of the innerTpl
		this.innerTpl = new Ext.XTemplate(tplHtml);

		//Overriding the itemTpl appling the params
		this.itemTpl = this.innerTpl.apply(params);
		
		//Check if an edit template has been defined
		if(Ext.isDefined(this.itemEditTpl)){
			
			//Replacing the template html in the params array
			params.tpl = (Ext.isString(this.itemEditTpl) ? this.itemEditTpl : this.itemEditTpl.html),
			
			//Definition of the innerEditTpl
			this.innerEditTpl = new Ext.XTemplate(tplHtml);

			//Overriding the itemEditTpl appling the params
			this.itemEditTpl = this.innerEditTpl.apply(params);

			//Definition of the editTpl
			this.editTpl = '<tpl for="."><div class="x-list-item ' + this.editItemCls + '"><div class="x-list-item-body">' + this.itemEditTpl + '</div></div></tpl>';
			this.editTpl = new Ext.XTemplate(this.editTpl);
			
		}
		
		//Creating an iterceptor to allow the css class managments
		this.itemtap = Ext.util.Functions.createInterceptor(this.itemtap, this.onItemTap, this);

		//Definitions of the CompositeElements which will contains all the icons and button
		this.deleteIcons = new Ext.CompositeElement();
		this.sortIcons = new Ext.CompositeElement();
		this.deleteButtons = new Ext.CompositeElement();
		
		//Calling the function able to init all the component events
		this.initEvents();

		//Superclass inizialization
		Ext.tux.EditableList.superclass.initComponent.call(this);
		
		//Adding the component events
		this.addEvents(

			/**
			 * @event beforeEditCompleted
			 * Fires just before the list switch his state to Editing.
             * @param {Ext.tux.EditableList} this The EditableList object.
			 */
			'beforeEditCompleted',

			/**
			 * @event editCompleted
			 * Fires after the list switch his state back from Editing to Normal.
             * @param {Ext.tux.EditableList} this The EditableList object.
			 */
            'editCompleted',

			/**
			 * @event deleteSectionChange
			 * Fires after the number of the elements marked as to delete change.
			 * <b>This event fires only if {@link #multiDelete} is set to True.</b>
             * @param {Ext.tux.EditableList} this The EditableList object.
			 * @param {Number} tot The total number of the elements marked as to delete.
			 */
			'deleteSectionChange'
			
        );

	},
	
	
	/**
	 * Reflesh the component.
	 * @private.
	 */
	refresh: function(){
	
		if (!this.rendered) {
			return
	    }
	
	    this.fireEvent("beforerefresh", this);
	
	    var b = this.getTargetEl(),
	        a = this.store.getRange(),
			c = this.collectData(a, 0),
			d = this.tpl;
	
	    b.update("");
	    if (a.length < 1) {
	        if (!this.deferEmptyText || this.hasSkippedEmptyText) {
	            b.update(this.emptyText)
	        }
	
			//Clearing all the CompositeElements
	        this.all.clear()
			this.deleteIcons.clear();
			this.sortIcons.clear();
			this.deleteButtons.clear();
			
	    } else {
	
			if(this.isEditing){
	        	if(Ext.isDefined(this.itemEditTpl)){
					d = this.editTpl;
				}
			}
			
			d.overwrite(b, c);
	        this.all.fill(Ext.query(this.itemSelector, b.dom));
	        this.updateIndexes(0);

			//Getting the left floating delete icons
			this.deleteIcons.fill(Ext.query('.x-list-left-icon', b.dom));
			
			//Getting the right floating sort icons
			if(this.allowSort){
				this.sortIcons.fill(Ext.query('.x-icon-sort', b.dom));
				
				//Calling the function able to create the sortable object
				this.createSortable();
			}
			
			//Getting the delete buttons
			if(!this.multiDelete){
				this.deleteButtons.fill(Ext.query('.x-button', b.dom));
			}

			//Calling the function which will handle the icons classes
			this.updateIconsCls();
	
	    }
	    this.hasSkippedEmptyText = true;
	    this.fireEvent("refresh", this);
		
	},
	
	/**
	 * Update all the icons CSS classes on List Reflesh.
	 * @private.
	 */
	updateIconsCls: function(){

		if(!this.isEditing){
			
			this.deleteIcons.addCls('x-list-left-hidden-icon');
			
			if(this.allowSort){
				this.sortIcons.addCls('x-list-right-hidden-icon');
			}
			
		}
		
		if(!this.multiDelete){
			this.deleteButtons.addCls('x-button-hidden');
		}
		
		/* If the list allow the element sorting, I need to handle the tapstart
		 * event on the sorticons to enable the sorter object */
		if(this.allowSort){
			this.sortIcons.on('tapstart', this.onStartSorting, this);
		}

	},
	
	/**
	 * Called whe the element sorting starts.
	 * @private.
	 */
	onStartSorting: function(){
	
		//Enabling the sortable object to allow user to order list elements
		this.sortable.enable();
	
		/* Calling the function that will bring the list out 
		 * from the deleting mode */
		if(!this.multiDelete && this.isDeleting){
			this.exitDeleteMode();
		}

	},
	
	/**
	 * Ask to the list to switch in edit state.
	 */
	edit: function(){
		
		//Check if the list is already in editing mode
		if(!this.isEditing){
		
			//Setting the list in editing mode
			this.isEditing = true;
		
			//Calling the function able to change the list state
			this.switchState(this.isEditing);
		}
		
	},
	
	/**
	 * Ask to the list to complete the edit mode and switch back to the normal state.
	 */
	editCompleted: function(){
	
		//Check if the list is already in editing mode
		if(this.isEditing){
			
			//Firing the "beforeEditCompleted" event
			this.fireEvent('beforeEditCompleted', this);

			//Setting the list in normal mode
			this.isEditing = false;
			
			//Calling the function able to change the list state
			this.switchState(this.isEditing);

			//Firing the "editCompleted" event
			this.fireEvent('editCompleted', this);

		}
		
	},
	
	/**
	 * Get the configured delete animation Cls.
	 */
	getDeleteAnimationCls: function(){
		return this.deleteAnimationCls;
	},
	
	/**
	 * Set the delete animation Cls.
	 * @param {String} setDeleteAnimationCls The new delete animation class.
	 */
	setDeleteAnimationCls: function(cls){
		this.deleteAnimationCls = cls;
	},

	/**
	 * Create the sortable object that will allow the user to order the list element
	 * simply by dragging them up and down.
	 * @private
	 */
	createSortable: function(){
		
		//Creation of the sortable object
		this.sortable = new Ext.tux.util.Sortable(this.el, {
            itemSelector: '.x-list-item',
            direction: 'vertical',
            scroll: true,
            constrain: true,
			disabled: true,
			listeners: {
				sortstart: function(){
				
					//The user is sorting the list elements
					this.isSorting = true;
					
				},
				sortend: function(sortable, el, e, oldIndex, newIndex){
					
					//Getting the record associated to the sorted element
					var record = this.store.getAt(oldIndex);
					
					//Removing the record from the store at it's original index
					this.store.removeAt(oldIndex);
					
					//Insert the record at his new index
					this.store.insert(newIndex, record);
					
					/* Disbaling the sortable object.
					 * this will be anable when the user will tap again
					 * on the sort icon. */
					sortable.disable();
					
					//The user is no longer sorting the list elements
					this.isSorting = false;
					
				},
				scope: this
			}
        });
		
	},
	
	/**
	 * Change the current state of the list.
	 * @param {Boolean} edit Tells if the list have to be put in edit state.
	 * @private
	 */
	switchState: function(edit){

		//Calling the list reflesh function
		this.refresh();

		//Check if requested the edit state
		if(edit){
			
			//Adding an additional x-list-editing class to the list component
			this.el.addCls('x-list-editing');
			
		//Else has been requested the normal state
		}else{
			
			//Removing the x-list-editing class from the list component
			this.el.removeCls('x-list-editing');
		}
	
		//Calling the function able to set the css classes to the left docked icons
		this.setIconCls(this.deleteIcons, 'left', edit);

		//Checking if the list allow the elements sorting
		if(this.allowSort){

			//Calling the function able to set the css classes to the right docked icons
			this.setIconCls(this.sortIcons, 'right', edit);
		}
		
	},
	
	/**
	 * Apply the new icons CSS classes on list state changed.
	 * @param {Ext.Element/Array} icons The icon/s on which to apply the new CSS classes.
	 * @param {String} pos The icon/s positions (left or right).
	 * @param {Boolean} edit Tells if the list have to be put in edit state.
	 * @private
	 */
	setIconCls: function(icons, pos, edit){
	
		//Setting the animation slide direction
		var direction = (edit ? 'in' : 'out');
	
		//Setting the animation class
		var animationCls = Ext.util.Format.format('x-{0}-icon-slide-{1}', pos, direction);
		
		//Setting the hidden icon class
		var iconHiddenCls = Ext.util.Format.format('x-list-{0}-hidden-icon', pos);

		//Adding the animation class to all the icons
		icons.addCls(animationCls);

		Ext.each(icons, function(icon){

			icon.on('webkitAnimationEnd', function(){

				//Check if the list have to be set in editing mode
				if(edit){

					//Removing the hidden icon class
					icon.removeCls(iconHiddenCls);

				}else{

					//Adding the hidden icon class
					icon.addCls(iconHiddenCls);

				}

				//Removing the animated class
				icon.removeCls(animationCls);
				
				//Cehck if the function is called for the left delete icons
				if(pos == 'left'){
				
					//Check if the list is set in multi delete mode
					if(this.multiDelete){

						//Check if the icon has the the selected icon applied
						if(icon.hasCls('x-icon-selected')){

							//Swap the selected with the deselected class
							icon.removeCls('x-icon-selected');
							icon.addCls('x-icon-deselected');

						}
						
					}
		
				}
				
			}, this);
			
		}, this);
		
		//Calling the function that will clear the delete selection
		this.clearDeleteSelection();
		
	},
	
	/**
	 * Clears the delete selections informations.
	 * @private
	 */
	clearDeleteSelection: function(){
	
		//Check if the list is set in multi delete mode
		if(this.multiDelete){
			
			//Clearing the total number of selected items
			this.deleteSectionCount = 0;
			
			//Firing the "deleteSectionChange" event
			this.fireEvent('deleteSectionChange', this, this.deleteSectionCount);
			
		}
		
	},

	/**
	 * Interceptor function linked on the onItemTap event.
	 * @param {Ext.tux.EditableList} this The EditableList object
	 * @param {Number} index The index of the item that was tapped
	 * @param {Ext.Element} item The item element
	 * @param {Ext.EventObject} e The event object
	 * @private
	 */
	onItemTap: function(list, index, item, e){
		
		//Checking if the list is in editing state
		if(this.isEditing){
		
			//Getting the tapped element
			var el = Ext.get(item.target);
		
			//Saving the element class name
			var className = el.dom.className;
		
			//Variables definition
			var listItem, deleteBtn, sortIcon, record;
		
			//Check if the list is set in SingleDelete mode
			if(!this.multiDelete){
		
				/* Calling the function that will bring the list out 
				 * from the deleting mode */
				this.exitDeleteMode();

				//Checking the tapped element className
				switch(className){
		
					case 'x-list-left-icon x-icon-delete':
			
						//Getting the list item element
						listItem = el.up('.x-list-item');

						//Getting the delete button
						deleteBtn = listItem.down('.x-button');

						//Adding the hidden icon class
						el.addCls('x-icon-rotate-start');
						
						//Adding the button slide-in animation class
						deleteBtn.addCls('x-button-slide-in');

						deleteBtn.on('webkitAnimationEnd', function(event){ 
			
							//Removing the button hidden class
							deleteBtn.removeCls('x-button-hidden');
			
							//Removing the animation icon class
							deleteBtn.removeCls('x-button-slide-in');
				
						});
			
						//Check if the list is set to handle the elements sorting
						if(this.allowSort){

							//Getting the sort icon
							sortIcon = listItem.down('.x-icon-sort');

							//Adding the button slide-out animation class to the sort icon
							sortIcon.addCls('x-right-icon-slide-out');

							sortIcon.on('webkitAnimationEnd', function(event){ 

								//Removing the animation icon class
								sortIcon.removeCls('x-right-icon-slide-out');

								//Adding the hidden icon class
								sortIcon.addCls('x-list-right-hidden-icon');

							});

						}
			
						//Saving the tapped icon
						this.tappedEl = listItem;
			
						//Setting the list in deleting state
						this.isDeleting = true;

						break;
				
					case 'x-button x-button-delete':
					case 'x-button-label':
			
						//Getting the record linked to the element to delete
						record = this.store.getAt(index);
			
						//Calling the function that will delete the selected item
						this.deleteItem(record, this.tappedEl);
			
						break;

				}
			
			//Otherwise the list is set in MultiDelete mode
			}else{

				//Getting the list item element
				listItem = (className == 'x-list-item' ? el : el.up('.x-list-item'));
			
				//Getting the sort icon
				selectIcon = listItem.down('.x-list-left-icon');
				
				//Getting the linked record
				var record = this.store.getAt(index);

				//Check if the icon has the the selected icon applied
				if(selectIcon.hasCls('x-icon-selected')){

					//Removing the the selected class
					selectIcon.removeCls('x-icon-selected');
					
					//Adding the the deselected class
					selectIcon.addCls('x-icon-deselected');
					
					//Setting the record as not to delete
					record.data.toDelete = false;
					
					//Incrementing the total number of selected elements
					this.deleteSectionCount--;
				
				//Otherwise the icon is deselected
				}else{

					//Removing the the deselected class
					selectIcon.removeCls('x-icon-deselected');
					
					//Adding the the selected class
					selectIcon.addCls('x-icon-selected');

					//Setting the record as to delete
					record.data.toDelete = true;
					
					//Decrementing the total number of selected elements
					this.deleteSectionCount++;
				
				}

				//Firing the "deleteSectionChange" event
				this.fireEvent('deleteSectionChange', this, this.deleteSectionCount);
			
			}
			
			//Don't fire the itemtap event
			return false;

		}

	},
	
	/**
	 * Exit from the delete Mode (Only if multiDelete = false).
	 * @private
	 */
	exitDeleteMode: function(){
	
		//Check if the list is in delete state
		if(this.isDeleting){

			//Getting the list item element
			var listItem = this.tappedEl;

			//Getting the delete icon
			var deleteIcon = listItem.down('.x-icon-delete');
			
			//Getting the sort icon
			var sortIcon = listItem.down('.x-icon-sort');
			
			//Getting the delete button
			deleteBtn = listItem.down('.x-button');

			//Adding the hidden icon class
			deleteIcon.removeCls('x-icon-rotate-start');

			//Adding the hidden icon class
			deleteIcon.addCls('x-icon-rotate-end');
	
			deleteIcon.on('webkitAnimationEnd', function(event){ 
	
				//Removing the animation icon class
				deleteIcon.removeCls('x-icon-rotate-end');
		
			});
	
			//Check if the list supports elements sorting
			if(this.allowSort){
				
				//Resetting the sort icon
				this.setIconCls(sortIcon, 'right', true);
			}
	
			//Adding the hidden icon class
			deleteBtn.addCls('x-button-slide-out');
	
			deleteBtn.on('webkitAnimationEnd', function(event){ 
	
				//Removing the animation icon class
				deleteBtn.removeCls('x-button-slide-out');
		
				//Adding the button hidden class
				deleteBtn.addCls('x-button-hidden');
		
			});
	
			//Removing the deleting state from the list
			this.isDeleting = false;
			
		}
		
	},
	
	/**
	 * Delete all the selected items marked as to delete.
	 */
	deleteSelected: function(){
	
		//Looping through all the records
		this.store.each(function(record){
			
			//Check if the current record is marked as to delete
			if(record.get('toDelete') == true){
				
				//Getting the index of the element to delete
				var index = this.store.indexOf(record);

				//Removing the current record from the store
				this.deleteItem(record, this.all.item(index));
				
			}
		
		}, this);
		
		//Calling the function that will clear the delete selection
		this.clearDeleteSelection();

	},
	
	/**
	 * Delete the selected item from the list.
     * @param {Ext.data.Record} record The record to delete.
	 * @param {Ext.Element} el The Ext.Element linked to the record to delete.
	 * @private.
	 */
	deleteItem: function(record, el){
		
		//Removing the animation icon class
		el.addCls(this.deleteAnimationCls);
		
		//Waiting that the element delete animation ends
		el.on('webkitAnimationEnd', function(event){ 
			
			//Ckeck if the ended animation name is the delete animation one
			if(event.browserEvent.animationName == this.deleteAnimationCls + '-animation'){

				//Removing the selected item from the store
				this.store.remove(record);
			
			}
	
		}, this);
		
	}

});

//Component type registration
Ext.reg('editablelist', Ext.tux.EditableList);