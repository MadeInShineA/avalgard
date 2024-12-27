import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TasksCollection } from './tasksCollection';

async function insertTask(name, description, date_time, user_id) {
    check(name, String);
    check(description, Match.Maybe([String]));
    check(date_time, Date);
    check(user_id, String);

    return await TasksCollection.insertAsync({
        _id: Random.id(),
        name: name, 
        description: description,
        date_time: date_time,
        user_id: user_id
    });
}

async function removeTask(taskId) {
    check(taskId, String);
    await TasksCollection.removeAsync(taskId);
}

Meteor.methods({ insertTask, removeTask });
