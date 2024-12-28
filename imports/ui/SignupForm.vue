<script setup>
import { ref } from 'vue';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

const username = ref('');
const password = ref('');

const loginFeedback = ref({message: '', success: false})

const handleSubmit = () => {

  const callback = (error) => {
    if (error) {
      console.log(error)
      loginFeedback.value.message = error.reason
      loginFeedback.value.success = false

    } else {
      console.log("Signup successful!");
      loginFeedback.value.message = 'Signup successful'
      loginFeedback.value.success = true
      router.push('/');
    }
  };


  Accounts.createUserAsync({
    username: username.value,
    password: password.value,
    callback
  });
}


</script>

<template>
  <form class="login-form" @submit.prevent="handleSubmit">
    <div>
      <label for="username">Username</label>
      <input
          id="username"
          name="username"
          type="text"
          placeholder="Username"
          required
          v-model="username"
      />
    </div>

    <div>
      <label for="password">Password</label>
      <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          required
          v-model="password"
      />
    </div>

    <div :class="loginFeedback.success ? 'text-green-400' : 'text-red-400'">
      {{ loginFeedback.message }}
    </div>

    <div>
      <button type="submit">Sign up</button>
    </div>
  </form>
</template>

<style>
.login-form {
  display: flex;
  flex-direction: column;
  height: 100%;

  justify-content: center;
  align-items: center;
}

.login-form > div {
  margin: 8px;
}

.login-form > div > label {
  font-weight: bold;
}

.login-form > div  > input {
  flex-grow: 1;
  box-sizing: border-box;
  padding: 10px 6px;
  background: transparent;
  border: 1px solid #aaa;
  width: 100%;
  font-size: 1em;
  margin-right: 16px;
  margin-top: 4px;
}

.login-form > div > input:focus {
  outline: 0;
}

.login-form > div > button {
  background-color: #62807e;
}
</style>
