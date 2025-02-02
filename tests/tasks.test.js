import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'chai';
import { Accounts } from 'meteor/accounts-base';
import '/imports/api/tasks/methods.js';

if (Meteor.isServer) {
  describe('Tasks Methods', function () {
    let userId;
    let gardenId;

    before(async function () {
        Meteor.methods({
        'plants.findById'(plantId) {
          // Return a mock plant record
          return {
            _id: plantId,
            name: 'Test Plant',
            waterRequirement: 1,  // daily
            harvestPeriod: 1,     // daily
            growthDuration: 1     // daily
          };
        },
        'climates.findById'(climateId) {
          // Return a mock climate record
          return {
            wateringFactor: 1,
            harvestFactor: 1,
            growthFactor: 1
          };
        }
      });
    });

    beforeEach(async function () {
      // Create a test user
      userId = await Accounts.createUserAsync({
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword',
        profile: {
          gardens: []
        }
      });

      // Create a dummy garden in the user's profile
      gardenId = Random.id();

      await Accounts.users.updateAsync(
        { _id: userId },
        {
          $push: {
            'profile.gardens': {
              _id: gardenId,
              name: 'Test Garden',
              climateId: Random.id(),
              height: 10,
              width: 10,
              tasks: [],
              plants: []
            }
          }
        }
      );
    });

    afterEach(async function () {
      // Clean up by removing the test user
      await Accounts.users.removeAsync({ _id: userId });
    });

    it('tasks.insert should insert a new task into the specified garden', async function () {
      const taskId = Random.id();
      const task = {
        _id: taskId,
        name: 'Sample Task',
        description: 'A test task description',
        deadLine: new Date(),
        completed: false
      };

      await Meteor.callAsync('tasks.insert', userId, gardenId, task);

      const user = await Accounts.users.findOneAsync(userId);
      const garden = user.profile.gardens.find((g) => g._id === gardenId);
      const insertedTask = garden.tasks.find((t) => t._id === taskId);

      assert.isOk(insertedTask, 'Expected the task to be inserted');
      assert.strictEqual(insertedTask.name, 'Sample Task');
      assert.strictEqual(insertedTask.completed, false);
    });

    it('tasks.remove should remove an existing task from the specified garden', async function () {
      const taskId = Random.id();
      const task = {
        _id: taskId,
        name: 'To be removed',
        description: 'Task that will be removed',
        deadLine: new Date(),
        completed: false
      };

      // Insert the task first
      await Meteor.callAsync('tasks.insert', userId, gardenId, task);

      // Now remove it
      await Meteor.callAsync('tasks.remove', userId, gardenId, taskId);

      const user = await Accounts.users.findOneAsync(userId);
      const garden = user.profile.gardens.find((g) => g._id === gardenId);
      const removedTask = garden.tasks.find((t) => t._id === taskId);

      assert.isNotOk(removedTask, 'Expected the task to be removed');
    });

    it('tasks.update should update fields of an existing task', async function () {
      const taskId = Random.id();
      const task = {
        _id: taskId,
        name: 'Old Name',
        description: 'Old description',
        deadLine: new Date(),
        completed: false
      };

      // Insert the task first
      await Meteor.callAsync('tasks.insert', userId, gardenId, task);

      // Update fields
      await Meteor.callAsync('tasks.update', userId, gardenId, taskId, {
        name: 'New Name',
        completed: true
      });

      const user = await Accounts.users.findOneAsync(userId);
      const garden = user.profile.gardens.find((g) => g._id === gardenId);
      const updatedTask = garden.tasks.find((t) => t._id === taskId);

      assert.strictEqual(updatedTask.name, 'New Name');
      assert.strictEqual(updatedTask.completed, true);
    });

    it('tasks.find should return a specific task by ID', async function () {
      const taskId = Random.id();
      const task = {
        _id: taskId,
        name: 'Find Me',
        description: 'Will be found by tasks.find',
        deadLine: new Date(),
        completed: false
      };

      await Meteor.callAsync('tasks.insert', userId, gardenId, task);

      const foundTask = await Meteor.callAsync('tasks.find', userId, gardenId, taskId);
      assert.isOk(foundTask, 'Expected to find the task');
      assert.strictEqual(foundTask.name, 'Find Me');
    });

    it('tasks.find should throw if the task does not exist', async function () {
      try {
        await Meteor.callAsync('tasks.find', userId, gardenId, Random.id());
        assert.fail('Expected an error to be thrown for non-existent task');
      } catch (error) {
        assert.strictEqual(error.error, 'not-found');
      }
    });

    it('tasks.findAll should return all tasks in a given garden', async function () {
      const taskA = {
        _id: Random.id(),
        name: 'Task A',
        description: 'First task',
        deadLine: new Date(),
        completed: false
      };
      const taskB = {
        _id: Random.id(),
        name: 'Task B',
        description: 'Second task',
        deadLine: new Date(),
        completed: false
      };

      await Meteor.callAsync('tasks.insert', userId, gardenId, taskA);
      await Meteor.callAsync('tasks.insert', userId, gardenId, taskB);

      const allTasks = await Meteor.callAsync('tasks.findAll', userId, gardenId);
      assert.strictEqual(allTasks.length, 2);
      const names = allTasks.map((t) => t.name);
      assert.include(names, 'Task A');
      assert.include(names, 'Task B');
    });

    it('tasks.countUnseen should return the total number of tasks where seen = false', async function () {
      // Insert tasks with various `seen` states
      const unseenTaskId = Random.id();
      const seenTaskId = Random.id();

      await Meteor.callAsync('tasks.insert', userId, gardenId, {
        _id: unseenTaskId,
        name: 'Unseen Task',
        description: 'Not yet seen',
        deadLine: new Date(),
        completed: false,
        seen: false
      });
      await Meteor.callAsync('tasks.insert', userId, gardenId, {
        _id: seenTaskId,
        name: 'Seen Task',
        description: 'Already seen',
        deadLine: new Date(),
        completed: false,
        seen: true
      });

      const unseenCount = await Meteor.callAsync('tasks.countUnseen', userId);
      assert.strictEqual(unseenCount, 1, 'Expected exactly 1 unseen task');
    });

    it('tasks.markAllAsSeen should mark all unseen tasks as seen (requires logged-in user)', async function () {
      // In real tests, you may need to stub `Meteor.userId()` or log in the user explicitly.
      // For demonstration, we'll override Meteor.userId temporarily:
      const originalUserId = Meteor.userId;
      Meteor.userId = () => userId;

      try {
        // Insert a couple of tasks with seen = false
        await Meteor.callAsync('tasks.insert', userId, gardenId, {
          _id: Random.id(),
          name: 'Unseen 1',
          description: 'Test unseen 1',
          deadLine: new Date(),
          completed: false,
          seen: false
        });
        await Meteor.callAsync('tasks.insert', userId, gardenId, {
          _id: Random.id(),
          name: 'Unseen 2',
          description: 'Test unseen 2',
          deadLine: new Date(),
          completed: false,
          seen: false
        });

        await Meteor.callAsync('tasks.markAllAsSeen');

        // Check that tasks are now seen
        const user = await Accounts.users.findOneAsync(userId);
        const garden = user.profile.gardens.find((g) => g._id === gardenId);
        const stillUnseen = garden.tasks.filter((t) => t.seen === false);
        assert.strictEqual(stillUnseen.length, 0, 'Expected no tasks to remain unseen');
      } finally {
        // Restore original Meteor.userId
        Meteor.userId = originalUserId;
      }
    });

    it('tasks.createAutomaticallyForGarden should add auto-tasks for each plant', async function () {
      // Add a plant to the test garden
      const plantId = Random.id();
      await Accounts.users.updateAsync(
        { _id: userId, 'profile.gardens._id': gardenId },
        {
          $push: {
            'profile.gardens.$.plants': {
              _id: plantId,
              plantId,  // references the same ID, which our mock plants.findById uses
              lastWateringDate: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
              lastHarvestDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
              lastCutDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
            }
          }
        }
      );

      // Call the method that auto-creates tasks
      await Meteor.callAsync('tasks.createAutomaticallyForGarden', userId, gardenId);

      const user = await Accounts.users.findOneAsync(userId);
      const garden = user.profile.gardens.find((g) => g._id === gardenId);
      const autoTasks = garden.tasks.filter((t) => t.isAutomatic);

      // We expect at least one auto task to be added (watering, harvest, cut, etc.)
      assert.isAbove(autoTasks.length, 0, 'Expected at least one automatic task to be created');
      // For example, check if at least the watering type was created
      const wateringTask = autoTasks.find((t) => t.type === 'watering');
      assert.isOk(wateringTask, 'Expected a watering task to be created automatically');
    });
  });
}
