import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
  'tasks.insert': async function (userId, gardenId, task) {
    check(userId, String);
    check(gardenId, String);
    check(task, {
      _id: String,
      name: String,
      description: String,
      deadLine: Date,
      completed: Boolean
    });

    const NonEmptyString = Match.Where((x) => {
      check(x, String);
      return x.length > 0;
    });
    check(task.name, NonEmptyString);

    return await Accounts.users.updateAsync(
      { _id: userId, 'profile.gardens._id': gardenId },
      { $push: { 'profile.gardens.$.tasks': task } }
    );
  },
  'tasks.remove': async function (userId, gardenId, taskId) {
    check(userId, String);
    check(gardenId, String);
    check(taskId, String);

    return await Accounts.users.updateAsync(
      { _id: userId, 'profile.gardens._id': gardenId },
      { $pull: { 'profile.gardens.$.tasks': { _id: taskId } } }
    );
  },
  'tasks.update': async function (userId, gardenId, taskId, updatedTask) {
    check(userId, String);
    check(gardenId, String);
    check(taskId, String);
    check(updatedTask, Match.ObjectIncluding({
      name: Match.Optional(String),
      description: Match.Optional(String),
      deadLine: Match.Optional(Date),
      completed: Match.Optional(Boolean),
    }));

    const setObject = {};
    Object.keys(updatedTask).forEach(key => {
      setObject[`profile.gardens.$.tasks.$[task].${key}`] = updatedTask[key];
    });

    return await Accounts.users.updateAsync(
      { _id: userId, 'profile.gardens._id': gardenId },
      { $set: setObject },
      { arrayFilters: [{ 'task._id': taskId }] }
    );
  },
  'tasks.find': async function (userId, gardenId, taskId) {
    check(userId, String);
    check(gardenId, String);
    check(taskId, String);

    const user = await Accounts.users.findOneAsync(userId);
    if (!user || !user.profile || !user.profile.gardens) {
      throw new Meteor.Error('not-found', 'User or garden not found');
    }

    const garden = user.profile.gardens.find(g => g._id === gardenId);
    if (!garden || !garden.tasks) {
      throw new Meteor.Error('not-found', 'Garden or tasks not found');
    }

    const task = garden.tasks.find(t => t._id === taskId);
    if (!task) {
      throw new Meteor.Error('not-found', 'Task not found');
    }

    return task;
  },
  'tasks.findAll': async function (userId, gardenId) {
    check(userId, String);
    check(gardenId, String);

    const user = await Accounts.users.findOneAsync(userId);
    if (!user || !user.profile || !user.profile.gardens) {
      throw new Meteor.Error('not-found', 'User or gardens not found');
    }

    const garden = user.profile.gardens.find(g => g._id === gardenId);
    if (!garden || !garden.tasks) {
      throw new Meteor.Error('not-found', 'Garden or tasks not found');
    }

    return garden.tasks;
  },
});