/**
 * @extends Ext.data.Model
 * Model able to contains the Contacts informations.
 */
Ext.regModel('Contact', {
	fields: [
		{name: 'firstName', type: 'string'},
		{name: 'lastName', type: 'string'}
	]
});