import { Meteor } from 'meteor/meteor';
import { TasksCollection } from './tasksCollection';

Meteor.publish('tasks', function publishTasks() {
    return TasksCollection.find();
});
