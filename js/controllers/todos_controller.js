/*global Todos, Ember */
(function () {
	'use strict';
	var instance = new Syncano({
		apiKey: "b52cb72f9b01c614d882bc5712a3f32b97cb9001",
		instance: "todolist",
		userKey: "680405847ef8175e53ee7c834fd9e27ca6312d22"
	});
	Todos.TodosController = Ember.ArrayController.extend({
		actions: {
			createTodo: function () {

				console.log("createTodo");
				var title, todo;

				// Get the todo title set by the "New Todo" text field
				title = this.get('newTitle').trim();
				if (!title) {
					return;
				}
				var self = this;
				var syncanoID;

				// Set up syncano object
				var syncanoObjectData = {"title": title, "iscompleted": false, "owner_permissions": "full"}
				var syncanoTodoObject = instance.class('todo').dataobject().add(syncanoObjectData);

				// After promise, set up new Todo Model
				syncanoTodoObject.then(function(res){
					syncanoID = res.id;
					// Create the new Todo model
					todo = self.store.createRecord('todo', {
						title: title,
						isCompleted: false,
						syncanoID: syncanoID
					});
					todo.save();
				});
				// Clear the "New Todo" text field
				this.set('newTitle', '');
			},

			clearCompleted: function () {
				console.log("clearCompleted")
				var completed = this.get('completed');
				completed.invoke('deleteRecord');
				completed.invoke('save');

				// clears completed objects in syncano
				var filter = {
					"query": {"iscompleted":{"_eq":true}}
				};
				var completedSyncanoTodoObjects = instance.class('todo').dataobject().list(filter);

				completedSyncanoTodoObjects.then(function(res){
					var i;
					for(i=0; i<res.objects.length; i++){
						var id = res.objects[i].id;
						instance.class('todo').dataobject(id).delete();
					}
				});

			}
		},

		/* properties */

		remaining: Ember.computed.filterBy('model', 'isCompleted', false),
		completed: Ember.computed.filterBy('model', 'isCompleted', true),

		allAreDone: function (key, value) {
			console.log("allAreDone");
			if (value !== undefined) {
				this.setEach('isCompleted', value);
				return value;
			} else {
				var length = this.get('length');
				var completedLength = this.get('completed.length');

				return length > 0 && length === completedLength;
			}
		}.property('length', 'completed.length')
	});
})();
