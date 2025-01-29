import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'chai';
import { Accounts } from 'meteor/accounts-base';
import '/imports/api/users/methods.js';

// Only run these tests on the server.
if (Meteor.isServer) {
  describe('createUserCustom Method', function () {
    let testUsername;
    let testPassword;

    // Generate a fresh username/password before each test
    beforeEach(function () {
      testUsername = `user_${Random.id().substring(0, 5)}`;
      testPassword = 'test12345';
    });

    // Remove the test user (if it exists) after each test
    afterEach(async function () {
      const existingUser = await Accounts.findUserByUsername(testUsername);
      if (existingUser) {
        await Meteor.users.removeAsync({ _id: existingUser._id });
      }
    });

    it('should create a new user and log them in if username does not exist', async function () {
      // Call our custom method
      const result = await Meteor.callAsync('createUserCustom', {
        username: testUsername,
        password: testPassword,
      });

      // Confirm the returned message
      assert.strictEqual(result, 'User created and logged in successfully!');

      // Confirm the user now exists in the DB
      const createdUser = await Accounts.findUserByUsername(testUsername);
      assert.isDefined(createdUser, 'User should exist after creation');
      assert.strictEqual(createdUser.username, testUsername);
    });

    it('should throw an error if the username already exists', async function () {
      // First, create the user
      await Meteor.callAsync('createUserCustom', {
        username: testUsername,
        password: testPassword,
      });

      // Attempt to create the same user again
      try {
        await Meteor.callAsync('createUserCustom', {
          username: testUsername,
          password: testPassword,
        });
        // If no error, fail the test
        assert.fail('Should have thrown an error but did not');
      } catch (error) {
        assert.strictEqual(error.error, 'user-exists');
        assert.strictEqual(
          error.reason,
          'A user with this username already exists.'
        );
      }
    });
  });
}
