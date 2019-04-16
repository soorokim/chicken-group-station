<template>
  <div id="app">
    <div class="container">
      <div class="row">
        <div class="col-md-6 offset-md-3">
          <ChatRoom />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChatRoom from './components/ChatRoom.vue'

export default {
  name: 'app',
  components: {
    ChatRoom
  }
}
</script>

<style>
