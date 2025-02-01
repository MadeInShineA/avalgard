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

  async updatePassword(oldPassword, newPassword) {
    check(oldPassword, String);
    check(newPassword, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error('not-authorized', 'Vous devez être connecté pour changer votre mot de passe.');
    }

    // Vérifie l'ancien mot de passe
    const passwordCheck = await Accounts.checkPassword(user, oldPassword);
    if (passwordCheck.error) {
      throw new Meteor.Error('invalid-password', 'Ancien mot de passe incorrect.');
    }

    // Change le mot de passe
    await Accounts.setPassword(user._id, newPassword);
    return 'Mot de passe mis à jour avec succès !';
  },

  async deleteUser(password) {
    check(password, String);

    const user = await Meteor.userAsync();
    if (!user) {
      throw new Meteor.Error('not-authorized');
    }

    const passwordCheck = await Accounts.checkPassword(user, password);
    if (passwordCheck.error) {
      throw new Meteor.Error('invalid-password', 'Mot de passe incorrect.');
    }

    await Meteor.users.remove({ _id: this.userId });
    return 'Compte supprimé avec succès.';
  }
});