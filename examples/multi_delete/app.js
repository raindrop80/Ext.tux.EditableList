/* 
 * AndreaCammarata.com
 * Copyright(c) 2011 SIMACS di Andea Cammarata
 */
Ext.regApplication('EditableListSample.', {
	
	//Definizione del punto di ingresso dell'applicazione
	launch: function() {
		
		//Definition of the application Viewport
		this.viewport = new Ext.Panel({
			fullscreen: true,
			layout: 'fit',
			dockedItems: [{
				//Definition of the top docked toolbar
				xtype: 'toolbar',
				itemId: 'toolbar',
				dock: 'top',
				title: 'Ext.tux.EditableList',
				items: [{
					/* Definition of the Edit Button that allow to switch the List state
					 * from editing to normal and vice versa */
					xtype: 'button',
					itemId: 'btnEdit',
					text: 'Edit',
					ui: 'action',
					scope: this,
					handler: function(btn){
						
						//Getting the list component
						var list = this.viewport.getComponent('lstContacts');
						
						//Getting the Delete button
						var btnDelete = this.viewport.getDockedComponent('btmToolbar').getComponent('btnDelete');
						
						//Check the button text
						if(btn.getText() == 'Edit'){
						
							//Calling the editable list edit function
							list.edit();
							
							//Showing the Delete button
							btnDelete.show('pop');
							
							//Changing the button Text
							btn.setText('Done');
							
						}else{
							
							//Calling the editable list edit function
							list.editCompleted();
							
							//Hiding the Delete button
							btnDelete.hide('pop');
							
							//Changing the button Text
							btn.setText('Edit');
							
						}
					}
				}]
			},{
				//Definition of the bottom docked toolbar
				xtype: 'toolbar',
				dock: 'bottom',
				itemId: 'btmToolbar',
				items: [{
					/* Definition of the button that allow to delete
					 * all the items marked as to delete */
					xtype: 'button',
					ui: 'delete',
					itemId: 'btnDelete',
					text: 'Delete',
					iconCls: 'trash',
					iconMask: true,
					hidden: true,
					disabled: true,
					handler: function(){
						
						//Getting the list component
						var list = this.viewport.getComponent('lstContacts');
						
						//Deleting all the marked records
						list.deleteSelected();
						
					},
					scope: this
				}]
			}],
			items: [{
				/* Definition of the custom Editable List component */
				xtype: 'editablelist',
				itemId: 'lstContacts',
				itemTpl: '{firstName} {lastName}',
			    store: 'Contacts',
				multiDelete: true,
				listeners: {
					deleteSectionChange: function(list, tot){
						
						//Getting the Delete button
						var btnDelete = this.viewport.getDockedComponent('btmToolbar').getComponent('btnDelete');
						
						if(tot != 0){
						
							//Updating the delete button text
							btnDelete.setText(Ext.util.Format.format('Delete ({0})', tot));
							
							//Enable the delete button
							btnDelete.enable();
							
						}else{
							
							//Updating the delete button text
							btnDelete.setText('Delete');
							
							//Disable the delete button
							btnDelete.disable();
							
						}
					},
					scope: this
				}
			}]
        });
		
	}
	
});