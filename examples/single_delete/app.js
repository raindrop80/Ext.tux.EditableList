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

						//Check the button text
						if(btn.getText() == 'Edit'){
						
							//Calling the editable list edit function
							list.edit();

							//Changing the button Text
							btn.setText('Done');
							
						}else{
							
							//Calling the editable list edit function
							list.editCompleted();
							
							//Changing the button Text
							btn.setText('Edit');
							
						}
					}
				}]
			}],
			items: [{
				/* Definition of the custom Editable List component */
				xtype: 'editablelist',
				itemId: 'lstContacts',
				itemTpl: '{firstName} {lastName}',
			    store: 'Contacts',
				multiDelete: false
			}]
        });
		
	}
	
});