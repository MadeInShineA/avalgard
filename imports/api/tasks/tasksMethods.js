import { Meteor } from 'meteor/meteor';
import { Random } from "meteor/random";
import { check, Match } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
  addTask(userId, gardenId, taskName, taskDescription, taskDeadline) {
    check(userId, String);
    check(gardenId, String);
    check(taskName, String);
    check(taskDescription, Match.Maybe(String)); // Description peut être facultative
    check(taskDeadline, Date);
  
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'Vous devez être connecté pour ajouter une tâche.');
    }
  
    if (this.userId !== userId) {
      throw new Meteor.Error('not-allowed', 'Vous ne pouvez ajouter des tâches qu\'à votre propre compte.');
    }
  
    const task = {
      _id: Random.id(),
      name: taskName,
      description: taskDescription || '',
      deadLine: taskDeadline,
      completed: false,
    };
  
    // TODO Remove hard coded garden id
    const updated = Meteor.users.updateAsync(
      { _id: userId, 'profile.gardens._id': '3CPxynxodk6AjFNHR' },
      { $push: { 'profile.gardens.$.tasks': task } }
    );
  
    if (!updated) {
      throw new Meteor.Error('update-failed', 'An error occured while adding the tasks to the garden');
    }
  
    return task;
  }
});

Meteor.methods({
  removeTask(userId, gardenId, taskId) {
    check(userId, String);
    check(gardenId, String);
    check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You need to be logged in to add a task');
    }
  
    if (this.userId !== userId) {
      throw new Meteor.Error('not-allowed', 'You are not allowed to add tasks to other users');
    }
  
    const updated = Meteor.users.updateAsync(
      { _id: userId, 'profile.gardens._id': gardenId },
      { $pull: { 'profile.gardens.$.tasks': { _id: taskId } } }
    );

    // Vérification du succès de la mise à jour
    if (!updated) {
      throw new Meteor.Error('update-failed', 'An error occured while deleting the task');
    }

    return { success: true, taskId }
  }
});
