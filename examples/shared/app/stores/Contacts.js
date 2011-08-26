/**
 * @extends Ext.data.Store
 * Store wich contains all the Contacts.
 */
Ext.regStore('Contacts', {
    model: 'Contact',
	getGroupString : function(record) {
		return record.get('lastName')[0];
	},
	data: [
	    {firstName: 'Tommy',   lastName: 'Maintz'},
        {firstName: 'Rob',     lastName: 'Dougan'},
        {firstName: 'Ed',      lastName: 'Spencer'},
        {firstName: 'Jamie',   lastName: 'Avins'},
        {firstName: 'Aaron',   lastName: 'Conran'},
        {firstName: 'Dave',    lastName: 'Kaneda'},
        {firstName: 'Michael', lastName: 'Mullany'},
        {firstName: 'Abraham', lastName: 'Elias'},
        {firstName: 'Jay',     lastName: 'Robinson'}
    ]
});

