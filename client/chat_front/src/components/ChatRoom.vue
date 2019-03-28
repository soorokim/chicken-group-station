<template>
  <div v-else class="card mt-3">
    <div class="card-title">
      <h3>치킨 모임 정거장</h3>
      <hr>
    </div>
    <div v-if="k_id === ''" id="need_login">
      <p>로그인이 필요한 곳입니다.</p>
      <div class="login_btn" v-on:click="loginWithKakao">
        <img src="//mud-kage.kakao.com/14/dn/btqbjxsO6vP/KPiGpdnsubSq3a0PHEGUK1/o.jpg"  width="300"/>
      </div>
    </div>
    <div v-else id="logged_in">
      <div class="my-info-body" >
        <label for="my-info">내 정보</label>
        <img :src="k_img">
        <p><span class="my-info">닉네임 : {{ k_nick }} </span></p>
      </div>
      <div class="card-body">
        <div class="chat-body">
          <div class="messages" v-for="(msg, index) in msgs" :key="index">
            <p><span class="font-weight-bold">{{ msg.k_nick }}: </span>{{ msg.msg }}</p>
          </div>
        </div>
      </div>
      <div class="user-list-body">
        <div class="gorm-group pb-3">
          <label for="user-list">접속한 사용자:</label>
          <div class="user-list" v-for="(user, index) in user_list" :key="index">
            <p><span class="font-weight-bold">{{ user }}</span></p>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <form @submit.prevent="send_msg">
          <div class="gorm-group pb-3">
            <input type="text" v-model="msg" class="form-control" label='Message:'>
            <button type="submit" class="btn btn-success">Send</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'
import Config from '@/assets/js/config'
export default {
  data(){
    return {
      k_id: '',
      k_nick: '',
      k_img: '',
      msg: '',
      msgs : [],
      user_list : [],
      socket : io(Config.server_url),
      scriptUrl : Config.kakao_sdk,
      apiKey : Config.kakao_apikey
    }
  },
  methods: {
      send_msg(e){
        e.preventDefault();
        let data = { k_nick: this.k_nick, msg: this.msg }
        this.socket.emit('send_msg',data);
        this.msg = ""
      },
      get_user(){
        const scriptId = '_kakao_login_'

        const isExist = !!document.getElementById(scriptId)

        if (!isExist) {
          console.log(this.scriptUrl);
          const script = document.createElement('script')
          script.src = this.scriptUrl
          script.onload = () => this.initiate()
          script.onerror = error => this.handleError(error)
          script.id = scriptId
          document.body.appendChild(script)
        } else{
          //this.initiate(this)
        }
      },

      initiate(){
        Kakao.init(this.apiKey);
      },

      onSuccess(data){
        console.log('success');
        this.k_id = data.id
        this.k_nick = data.properties.nickname
        this.k_img = data.properties.thumbnail_image
        this.socket.emit('newUser',this.k_nick);
      },

      onFailure(data){
        console.log('fail');
        console.log(data);
      },

      onKakaoError(data){
        console.log('error');
        console.log(data);
      },

      loginWithKakao(){
        let ref = this;
        Kakao.Auth.login({
          success(authObj){

            Kakao.API.request({
              url: '/v1/user/me',
              success: function(res){
                ref.onSuccess(res);
              },
              fail(err){
                ref.onFailure(err);
              }
            });
          },
          fail(err){
            ref.onFailure(err);
          }
        });
      },

      handleError(err){
        console.log(err);
        console.warn(`This component threw an error (in '${err.target.outerHTML}'):`, this)
      }
  },
  mounted() {
    this.socket.on('connect',() => {
      this.get_user()
    })

    this.socket.on('update',(data) => {
      this.msgs = [...this.msgs, data];
      //this.msgs.push(data)
    });

    this.socket.on('user_update',(user) => {
      this.user_list = user
    });
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.chat-body {
  width: 580px;
  padding: 20px;
  margin-bottom: 20px;
  float: left;
  border: 1px solid #bcbcbc;
}

.user-list-body {
  width: 260px;
  padding: 20px;
  margin-bottom: 20px;
  float: right;
  border: 1px solid #bcbcbc;
}

.chat-input {
  clear: both;
  padding: 20px;
  border: 1px solid #bcbcbc;
}

.my-info-body {
  width: 160px;
  padding: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
  float: left;
  border: 1px solid #bcbcbc;
}

.need_login {
  margin: 0 auto;
  align: center;
}
</style>
