import { check } from 'meteor/check';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

Meteor.methods({
  async createUserCustom(user) {
    // Validate the user data
    check(user, {
      username: String,
      password: String,
    });

    // Check if the username already exists (await the promise)
    const existingUser = await Accounts.findUserByUsername(user.username);

    if (existingUser) {
      throw new Meteor.Error('user-exists', 'A user with this username already exists.');
    }

    // Create the user since the username doesn't exist
    const userId = await Accounts.createUser({
      username: user.username,
      password: user.password,
    });

    this.setUserId(userId)
    return 'User created and logged in successfully!';
  },
});

