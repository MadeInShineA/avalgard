<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { Accounts } from 'meteor/accounts-base';

const router = useRouter()
const username = ref('');
const password = ref('');

const registerFeedback = ref({ message: '', success: false })

const handleSubmit = () => {

  const callback = (error) => {
    if (error) {
      console.log(error)
      registerFeedback.value.message = error.reason
      registerFeedback.value.success = false

    } else {
      registerFeedback.value.message = 'Signup successful'
      registerFeedback.value.success = true
      Meteor.loginWithPassword(user.username, user.password)
      router.push('/');
    }
  };

  let user = {
    username: username.value,
    password: password.value
  }

  Meteor.call('createUserCustom', user, callback)


}


</script>

<template>
  <form class="login-form" @submit.prevent="handleSubmit">
    <div>
      <label for="username">Username</label>
      <input id="username" name="username" type="text" placeholder="Username" required v-model="username" />
    </div>

    <div>
      <label for="password">Password</label>
      <input id="password" name="password" type="password" placeholder="Password" required v-model="password" />
    </div>

    <div :class="registerFeedback.success ? 'text-green-400' : 'text-red-400'">
      {{ registerFeedback.message }}
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

.login-form>div {
  margin: 8px;
}

.login-form>div>label {
  font-weight: bold;
}

.login-form>div>input {
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

.login-form>div>input:focus {
  outline: 0;
}

.login-form>div>button {
  background-color: #62807e;
}
</style>
