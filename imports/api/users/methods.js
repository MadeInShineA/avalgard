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
      profile: { gardens: [] },
    });

    this.setUserId(userId);
    return 'User created and logged in successfully!';
  },

  async updateUsername(newUsername) {
    check(newUsername, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const existingUser = await Accounts.findUserByUsername(newUsername);
    if (existingUser) {
      throw new Meteor.Error('username-exists', 'Ce nom d\'utilisateur est déjà pris.');
    }

    await Accounts.setUsername(this.userId, newUsername);
    return 'Nom d\'utilisateur mis à jour avec succès !';
  },

  async deleteUserAccount(password) {
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to delete your account.");
    }
    
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user || !user.services || !user.services.password || !user.services.password.bcrypt) {
      throw new Meteor.Error("user-invalid", "Unable to check user password.");
    }
    
    if (Meteor.users.removeAsync) {
      await Meteor.users.removeAsync(this.userId);
    } else {
      await Meteor.users.rawCollection().deleteOne({ _id: this.userId });
    }
    
    return true;
  },
  
  'users.createTasksAutomatically': async function(userId){
    const gardens = await Meteor.call('gardens.findAll', userId)

    for(const garden of gardens){
      await Meteor.call('tasks.createAutomaticallyForGarden', userId, garden._id)
    }
  }
});
