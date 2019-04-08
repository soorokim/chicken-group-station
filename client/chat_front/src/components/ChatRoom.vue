<template>
  <div class="card mt-3">
    <div class="card-title">
      <h3>치킨 모임 정거장</h3>
      <hr>
    </div>
    <div v-if="user.k_id === ''" id="need_login">
      <p>로그인이 필요한 곳입니다.</p>
      <div class="login_btn" >
          <img src="//mud-kage.kakao.com/14/dn/btqbjxsO6vP/KPiGpdnsubSq3a0PHEGUK1/o.jpg" v-on:click="loginWithKakao" width="300"/>
      </div>
    </div>
    <div v-else id="logged_in">
      <div class="my-info-body" >
        <label for="my-info">내 정보</label>
        <img :src="user.k_img">
        <p><span class="my-info">닉네임 : {{ user.k_nick }} </span></p>
      </div>
      <div class="card-body">
        <div class="chat-body">
          <div class="messages" v-for="(msg, index) in msgs" :key="index">
            <p>
              <img v-if="msg.k_id != 'SERVER'"
                    v-bind:src="user_list[msg.k_id].img"
                    id="user_img">
                <span v-if="msg.k_id == 'SERVER'" class="font-weight-bold">{{ msg.k_id}}: </span>
                <span v-else class="font-weight-bold">{{ user_list[msg.k_id].nick }}: </span>{{ msg.msg }}</p>
          </div>
        </div>
      </div>

      <div class="user-list-body">
        <div class="gorm-group pb-3">
          <label for="user-list">접속한 사용자:</label>
          <button type="button" name="kick" value="강퇴" @click='kick_user()' v-if='user.perm'>강퇴하기</button>
          <div class="user-list" v-for="(_user,index) in user_list" :key="index" >
            <p>
              <input type="checkbox" :id="_user.id" :value="_user.id" v-model="checked_id" v-if='user.perm'>
              <img v-bind:src="_user.img" id="user_img"> <span class="font-weight-bold">{{ _user.nick }}</span>
            </p>
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
/* eslint-disable */
import io from 'socket.io-client'
import Config from '@/assets/js/config'
export default {
  data(){
    return {
      user: {
        k_id: '',
        k_nick: '',
        k_img: '',
        perm: false,
      },
      msg: '',
      checked_id : [],
      msgs : [],
      user_list : {},
      socket : io(Config.server_url),
      scriptUrl : Config.kakao_sdk,
      apiKey : Config.kakao_apikey
    }
  },
  methods: {
      send_msg(e){
        e.preventDefault();
        if(this.msg){
          let data = { k_id: this.user.k_id, msg: this.msg }
          this.socket.emit('send_msg',data);
          this.msg = ""
        }
      },
      make_kakao_login(){
        const scriptId = '_kakao_login_'

        const isExist = !!document.getElementById(scriptId)

        if (!isExist) {
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

      kick_user(){
        if (this.checked_id){
          let data = {}
          data.reason = prompt("사유를 입력해 주세요")
          this.checked_id.forEach((id) => {
            data.k_id = id
            this.socket.emit('kick',data);
          })
        }
      },

      initiate(){
        Kakao.init(this.apiKey);
      },

      onSuccess(data){
        console.log('success');
        let user = {}
        user.k_id = data.id
        user.k_nick = data.properties.nickname
        user.k_img = data.properties.thumbnail_image
        this.socket.emit('newUser',user);
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
      console.log('connect')
    })

    this.socket.on('user_data',(user) => {
      if (user) {
        this.user = user
      } else {
        alert("입장하실수 없습니다.")
      }
    })

    this.socket.on('update',(data) => {
      this.msgs = [...this.msgs, data];
      let msgbox = this.$el.querySelector('.chat-body')
      msgbox.scrollTop = msgbox.scrollHeight;
      //this.msgs.push(data)
    });

    this.socket.on('user_update',(users) => {
      console.log("user update! ")
      this.user_list = {}
      users.forEach((user) => {
        this.$set(this.user_list, user.k_id, {'img': user.k_img, 'nick':user.k_nick, 'id':user.k_id})
      })
      console.log(this.user_list)
    });

    this.socket.on('forced_out',(reason) => {
      alert("추방당하셨습니다. 사유: "+reason)
      setTimeout(function(){ document.location.reload(); }, 5000);
    });
  },
  created() {
    this.make_kakao_login()
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#user_img {
    width: 25px; height: 25px;
    object-fit: cover;
    border-radius: 23%;
}
.chat-body {
  overflow:scroll;
  height:400px;
  width: 580px;
  padding: 20px;
  margin-bottom: 20px;
  float: left;
  border: 1px solid #bcbcbc;
}

.user-list-body {
  overflow:scroll;
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
