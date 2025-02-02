import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'chai';
import { Accounts } from 'meteor/accounts-base';
import '/imports/api/users/methods.js';

if (Meteor.isServer) {
  describe('User Methods', function () {
    describe('createUserCustom', function () {
      it('should create a new user when username does not exist', async function () {
        const username = `user-${Random.id()}`;
        const result = await Meteor.callAsync('createUserCustom', {
          username,
          password: 'testPassword123',
        });

        // Check the return message
        assert.strictEqual(result, 'User created and logged in successfully!');

        // Verify the user was actually created
        const newUser = await Accounts.findUserByUsername(username);
        assert.isOk(newUser, 'Expected user to exist after creation');
      });

      it('should throw an error if username already exists', async function () {
        const username = `duplicate-${Random.id()}`;
        
        // First creation
        await Meteor.callAsync('createUserCustom', {
          username,
          password: 'testPassword123',
        });

        // Second creation with the same username should fail
        try {
          await Meteor.callAsync('createUserCustom', {
            username,
            password: 'newPassword',
          });
          assert.fail('Expected an error about existing username');
        } catch (error) {
          assert.strictEqual(error.error, 'user-exists');
        }
      });
    });

    describe('updateUsername', function () {
      let userId;
      const oldUsername = `oldUser-${Random.id()}`;

      beforeEach(async function () {
        // Create a user directly via Accounts to test updateUsername
        userId = await Accounts.createUserAsync({
          username: oldUsername,
          password: 'some-password',
          profile: { gardens: [] },
        });
      });

      afterEach(async function () {
        // Clean up after each test
        await Meteor.users.removeAsync(userId);
      });

      it('should throw not-authorized if there is no logged-in user', async function () {
        try {
          // We do NOT override Meteor.userId here, so the method sees no user is logged in
          await Meteor.callAsync('updateUsername', 'newUsername');
          assert.fail('Expected a "not-authorized" error.');
        } catch (error) {
          assert.strictEqual(error.error, 'not-authorized');
        }
      });

      it('should update the username when user is logged in and new name is free', async function () {
        const originalUserIdFunction = Meteor.userId;
        Meteor.userId = () => userId; // override to simulate a logged-in user

        try {
          const result = await Meteor.callAsync('updateUsername', 'brandNewUsername');
          assert.strictEqual(result, 'Nom d\'utilisateur mis à jour avec succès !');

          // Make sure the username was updated
          const updatedUser = await Meteor.users.findOneAsync(userId);
          assert.strictEqual(updatedUser.username, 'brandNewUsername');
        } finally {
          Meteor.userId = originalUserIdFunction; // restore
        }
      });

      it('should throw "username-exists" if the new username is already in use', async function () {
        // Create another user with some username
        const secondUsername = `secondUser-${Random.id()}`;
        const secondUserId = await Accounts.createUserAsync({
          username: secondUsername,
          password: 'another-password',
        });

        // Now, from our first user, try to update to secondUsername
        const originalUserIdFunction = Meteor.userId;
        Meteor.userId = () => userId;

        try {
          await Meteor.callAsync('updateUsername', secondUsername);
          assert.fail('Expected a "username-exists" error');
        } catch (error) {
          assert.strictEqual(error.error, 'username-exists');
        } finally {
          Meteor.userId = originalUserIdFunction;
        }

        // Remove second user to clean up
        await Meteor.users.removeAsync(secondUserId);
      });
    });

    describe('deleteUserAccount', function () {
      let userId;

      beforeEach(async function () {
        // Create a user to be deleted
        userId = await Accounts.createUserAsync({
          username: `deleteMe-${Random.id()}`,
          password: 'some-password',
        });
      });

      afterEach(async function () {
        // Ensure cleanup if a test fails
        const user = await Meteor.users.findOneAsync(userId);
        if (user) {
          await Meteor.users.removeAsync(userId);
        }
      });

      it('should throw "not-authorized" if user is not logged in', async function () {
        try {
          await Meteor.callAsync('deleteUserAccount', 'irrelevant-password');
          assert.fail('Expected a not-authorized error');
        } catch (error) {
          assert.strictEqual(error.error, 'not-authorized');
        }
      });

      it('should delete the user if logged in', async function () {
        const originalUserIdFunction = Meteor.userId;
        Meteor.userId = () => userId;

        try {
          const result = await Meteor.callAsync('deleteUserAccount', 'somePassword');
          assert.strictEqual(result, true, 'Expected a boolean "true" return');

          // Check user no longer exists
          const deletedUser = await Meteor.users.findOneAsync(userId);
          assert.isNull(deletedUser, 'User should have been deleted');
        } finally {
          Meteor.userId = originalUserIdFunction;
        }
      });
    });

    describe('users.createTasksAutomatically', function () {
      let userId;
      let callHistory;

      before(async function () {
        // We need "gardens.findAll" and "tasks.createAutomaticallyForGarden" to exist
        // or to mock them. Here, we'll mock them within Meteor.methods:
        // This approach only works if your code does NOT define them yet 
        // or you can temporarily redefine them. 
        // If they are already defined, you might do a spy/stub approach via something like Sinon.
        Meteor.methods({
          'gardens.findAll'(uId) {
            callHistory.push(['gardens.findAll', uId]);
            return [
              { _id: 'g1' },
              { _id: 'g2' },
            ];
          },
          'tasks.createAutomaticallyForGarden'(uId, gardenId) {
            callHistory.push(['tasks.createAutomaticallyForGarden', uId, gardenId]);
            return true;
          },
        });
      });

      beforeEach(async function () {
        callHistory = [];
        userId = await Accounts.createUserAsync({
          username: `user-for-task-auto-${Random.id()}`,
          password: 'pass123'
        });
      });

      afterEach(async function () {
        await Meteor.users.removeAsync(userId);
      });

      it('should call gardens.findAll and tasks.createAutomaticallyForGarden for each garden', async function () {
        await Meteor.callAsync('users.createTasksAutomatically', userId);

        // Check the call history
        // We expect:
        // 1) "gardens.findAll" was called with userId
        // 2) "tasks.createAutomaticallyForGarden" was called for each garden in the array
        const firstCall = callHistory[0];
        assert.deepEqual(firstCall, ['gardens.findAll', userId]);

        const secondCall = callHistory[1];
        const thirdCall = callHistory[2];
        assert.deepEqual(secondCall, ['tasks.createAutomaticallyForGarden', userId, 'g1']);
        assert.deepEqual(thirdCall, ['tasks.createAutomaticallyForGarden', userId, 'g2']);

        // So total calls: 3
        assert.strictEqual(callHistory.length, 3);
      });
    });
  });
}
