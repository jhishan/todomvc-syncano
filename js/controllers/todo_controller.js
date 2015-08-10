/*global Todos, Ember */

(function () {
	'use strict';
	var instance = new Syncano({
		apiKey: "b52cb72f9b01c614d882bc5712a3f32b97cb9001",
		instance: "todolist",
		userKey: "680405847ef8175e53ee7c834fd9e27ca6312d22"
	});
	Todos.TodoController = Ember.ObjectController.extend({
		isEditing: false,

		// We use the bufferedTitle to store the original value of
		// the model's title so that we can roll it back later in the
		// `cancelEditing` action.
		bufferedTitle: Ember.computed.oneWay('title'),

		actions: {
			editTodo: function () {
				console.log("editTodo");
				this.set('isEditing', true);
			},

			doneEditing: function () {
				console.log("doneEditing")
				var bufferedTitle = this.get('bufferedTitle').trim();

				if (Ember.isEmpty(bufferedTitle)) {
					// The `doneEditing` action gets sent twice when the user hits
					// enter (once via 'insert-newline' and once via 'focus-out').
					//
					// We debounce our call to 'removeTodo' so that it only gets
					// made once.
					Ember.run.debounce(this, 'removeTodo', 0);
				} else {
					var todo = this.get('model');
					todo.set('title', bufferedTitle);
					todo.save();
					// updates syncano object
					var syncanoID = todo.get("syncanoID");
					instance.class("todo").dataobject(syncanoID).update({"title": bufferedTitle});
				}

				// Re-set our newly edited title to persist its trimmed version
				this.set('bufferedTitle', bufferedTitle);
				this.set('isEditing', false);
			},

			cancelEditing: function () {
				console.log("cancelEditing")
				this.set('bufferedTitle', this.get('title'));
				this.set('isEditing', false);
			},

			removeTodo: function () {
				console.log("removeTodoWrapper")
				this.removeTodo();
			}
		},
		// removes todo from syncano and local storage
		removeTodo: function () {
			console.log("removeTodo");
			var todo = this.get('model');
			var id = todo.get("syncanoID");
			instance.class('todo').dataobject(id).delete();

			todo.deleteRecord();
			todo.save();
		},

		// Updates syncano todo object with new 'isCompleted' status
		saveWhenCompleted: function () {
			console.log("saveWhenCompleted");
			this.get('model').save();
			var todo = this.get('model');
			var syncanoID = todo.get("syncanoID");
			var completed = todo.get("isCompleted");
			instance.class("todo").dataobject(syncanoID).update({"iscompleted": completed});
		}.observes('isCompleted')
	});
})();
