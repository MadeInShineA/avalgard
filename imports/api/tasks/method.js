import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { Random } from "meteor/random";

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
  'tasks.countUnseen': async function(userId) {
    check(userId, String);
    
    const user = await Meteor.users.findOneAsync(userId, {
      fields: {
        'profile.gardens.tasks.seen': 1
      }
    });

    if (!user || !user.profile?.gardens) return 0;

    let unseenCount = 0;
    
    user.profile.gardens.forEach(garden => {
      if (garden.tasks) {
        garden.tasks.forEach(task => {
          if (task.seen === false) {
            unseenCount++;
          }
        });
      }
    });

    return unseenCount;
  },
  'tasks.markAllAsSeen': async function() {
      const userId = Meteor.userId();
      if (!userId) throw new Meteor.Error('unauthorized', 'Not logged in');

      const result = await Meteor.users.updateAsync(
          { _id: userId },
          {
              $set: {
                  "profile.gardens.$[].tasks.$[task].seen": true
              }
          },
          {
              arrayFilters: [{ "task.seen": false }],
              multi: true
          }
      );

      return result;
  },
  'tasks.createAutomaticallyForGarden': async function(userId, gardenId) {
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

    const plants = garden.plants

    let oldTasks = garden.tasks
    let newTasks = []

    for(const plant of plants) {
      const dbPlant = await Meteor.call("plants.findById", plant.plantId)
      const wateringTasks = oldTasks.filter((task) => task.plantId == plant._id && task.type == "watering")
      const harvestTasks = oldTasks.filter(task => task.plantId == plant._id && task.type == "harvest");
      const cutTasks = oldTasks.filter((task) => task.plantId == plant._id && task.type == "cut")

      const lastWateringTask = wateringTasks.reduce((latest, task) => 
        !latest || new Date(task.createDate) > new Date(latest.createDate) ? task : latest, 
        null
      );

      let lastHarvestTask = harvestTasks.reduce((latest, task) => 
        !latest || new Date(task.createDate) > new Date(latest.createDate) ? task : latest, 
        null
      );

      const lastCutTask = cutTasks.reduce((latest, task) => 
        !latest || new Date(task.createDate) > new Date(latest.createDate) ? task : latest, 
        null
      );

      let lastWateringTaskCreateDate = lastWateringTask ? lastWateringTask.createDate : null
      let lastHarvestTaskCreateDate = lastHarvestTask ? lastHarvestTask.createDate : null
      let lastCutTaskCreateDate = lastCutTask ? lastCutTask.createDate : null

      let tryToSendWateringNotification = true
      let tryToSendHarvestNotification = true
      let tryToSendCutNotification

      const today = new Date()

      if(lastWateringTaskCreateDate){
        const diffTime = Math.abs(today - lastWateringTaskCreateDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 1){
          tryToSendWateringNotification = false
        }
      }

      if(lastHarvestTaskCreateDate){
        const diffTime = Math.abs(today - lastHarvestTaskCreateDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 1){
          tryToSendHarvestNotification = false
        }
      }

      if(lastCutTaskCreateDate){
        const diffTime = Math.abs(today - lastWateringTaskCreateDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 1){
          tryToSendCutNotification = false
        }
      }

      const climate = await Meteor.call('climates.findById', garden.climateId)

      if(tryToSendWateringNotification){
        const numberOfHoursUntilNewWateringNotification = dbPlant.waterRequirement * climate.wateringFactor * 24
        const lastWateringDate = new Date(plant.lastWateringDate)
        const diffTime = Math.abs(today - lastWateringDate);
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
       
        if (diffHours > numberOfHoursUntilNewWateringNotification){
          const newTask = {
            _id: Random.id(),
            name: "Watering task for " + dbPlant.name,
            description: "You need to water this plant!",
            deadLine: today,
            completed: false,
            type: "watering",
            createDate: today,
            seen: false,
            plantId: plant._id,
            isAutomatic: true
          }

          newTasks.push(newTask)
        }
      }

      if(tryToSendHarvestNotification){
        const numberOfHoursUntilNewHarvestNotification = dbPlant.harvestPeriod * climate.harvestFactor * 24
        const lastHarvestDate = new Date(plant.lastHarvestDate)

        const diffTime = Math.abs(today - lastHarvestDate);
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

        if (diffHours > numberOfHoursUntilNewHarvestNotification){
          const newTask = {
            _id: Random.id(),
            name: "Harvest task for " + dbPlant.name,
            description: "You need to harvest this plant!",
            deadLine: today,
            completed: false,
            type: "harvest",
            createDate: today,
            seen: false,
            plantId: plant._id,
            isAutomatic: true
          }

          newTasks.push(newTask)
        }
      }

      if(tryToSendCutNotification){
        const numberOfHoursUntilNewCutNotification = dbPlant.growthDuration * climate.growthFactor * 24
        const lastCutDate = new Date(plant.lastCutDate)

        const diffTime = Math.abs(today - lastCutDate);
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

        if (diffHours > numberOfHoursUntilNewCutNotification){
          const newTask = {
            _id: Random.id(),
            name: "Growth task for " + dbPlant.name,
            description: "You need to cut this plant!",
            deadLine: today,
            completed: false,
            type: "cut",
            createDate: today,
            seen: false,
            plantId: plant._id,
            isAutomatic: true
          }

          newTasks.push(newTask)
        }
      }
    }

   for(const task of newTasks) {
      await Accounts.users.updateAsync(
        { _id: userId, 'profile.gardens._id': gardenId },
        { $push: { 'profile.gardens.$.tasks': task } }
      );
    }
  },  
});