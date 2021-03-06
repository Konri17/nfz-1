Vue.prototype.$http = axios

new Vue({
  el: '#container',
  data() {
    return {
          // host address
          host: "127.0.0.1",
          // host port
          port: '8080',
          
          login_selected: true,
          password_selected: true,
          isSessionActive: false,
          loginWindowError: null,
          sessionToken: null,
          isFavTable: false,
          region_selected: true,
          case_selected: true,
          number_selected: true,
          r_response: false,
          logResponse: false,
          serverError: false,
          serverErrorInfo: null,
          data: null,
          history: null,
          consoleMessage: null,
          signInAction: false,
          signUpAction: false,
          login: null,
          password: null,
          form_default: {
              region: "",
              r_case: "",
              benefit: "",
              r_number: "",
              r_location: "",
          },
          regions: [
            { text: 'dolnośląskie', value: '01' },
            { text: 'kujawsko-pomorskie', value: '02' },
            { text: 'lubelskie', value: '03' },
            { text: 'lubuskie', value: '04' },
            { text: 'łódzkie', value: '05' },
            { text: 'małopolskie', value: '06' },
            { text: 'mazowieckie', value: '07' },
            { text: 'opolskie', value: '08' },
            { text: 'podkarpackie', value: '09' },
            { text: 'podlaskie', value: '10' },
            { text: 'pomorskie', value: '11' },
            { text: 'śląskie', value: '12' },
            { text: 'świętokrzyskie', value: '13' },
            { text: 'warmińsko-mazurskie', value: '14' },
            { text: 'wielkopolskie', value: '15' },
            { text: 'zachodniopomorskie', value: '16' }
          ],
          r_cases: [
            { text: 'stabilny', value: '1'},
            { text: 'pilny', value: '2'},
          ],
          numbers: [
            { text: '11', value: '11'},
            { text: '12', value: '12'},
            { text: '13', value: '13'},
            { text: '14', value: '14'},
            { text: '15', value: '15'},
            { text: '16', value: '16'},
            { text: '17', value: '17'},
            { text: '18', value: '18'},
            { text: '19', value: '19'},
            { text: '20', value: '20'},
            { text: '21', value: '21'},
            { text: '22', value: '22'},
            { text: '23', value: '23'},
            { text: '24', value: '24'},
            { text: '25', value: '25'},
          ],
    }
  },
  methods: {
      applyInputStyle: function(isSelected) {
          return [isSelected ? 'good-input-ok' : 'no-input-warning'];
      },
      posts: function() {
          // first validate data
          var good = true
          if (!this.form_default.region) {
              // console.log("no region");
              good = false;
              this.region_selected = false;
          } else {
              this.region_selected = true;
          }
          if (!this.form_default.r_case) {
              // console.log("no case");
              good = false;
              this.case_selected = false;
          } else {
              this.case_selected = true;
          }
          if (!this.form_default.r_number) {
              // console.log("no number");
              good = false;
              this.number_selected = false;
          } else {
              this.number_selected = true;
          }
          if(!good) {
              // missing form fields
              return;
          }
          // debug - print selected fields
          // console.log("region " + this.form_default.region);
          // console.log("case " + this.form_default.r_case);
          // console.log("benefit " + this.form_default.benefit);
          this.clearBoard();
          this.sendRequest({
                r_region: this.form_default.region,
                r_case: this.form_default.r_case,
                r_benefit: this.form_default.benefit,
                r_number: this.form_default.r_number,
                r_location: this.form_default.r_location,
                r_token: this.sessionToken,
          }, '/get', true);
      
     
          
    },
    sendRequest:function(params, endpoint, p) {
        // console.log('req');
        var self=this;
        this.consoleMessage = "Czekaj...";
        this.serverError = false;
        this.$http.get('http://' + this.host+ ':' +this.port+ endpoint, {
              params
          }).then(function(response){
            if(response.status == "200"){
              // console.log(response.data)
              //self.data = response.data;
              self.consoleMessage = null;
              if (p) {
                  self.data = response.data;
                  self.r_response = true;
                  self.isFavTable = false;
              } else {
                  self.sessionToken = response.data[0]["ticket"];
                  self.logResponse = true;
              }
              self.serverError = false;
          }
      
        }).catch((e) => {
            console.log(e);
            self.serverErrorInfo = e;
            self.serverError = true;
            self.consoleMessage = null;
            self.r_response = false;
            self.logResponse = false;
        }
      )
    },
    signIn: function() {
        var good=true;
        if (!this.login) {
            // console.log("no login");
            good = false;
            this.login_selected = false;
        } else {
            this.login_selected = true;
        }
        if (!this.password) {
            console.log("no password");
            good = false;
            this.password_selected = false;
        } else {
            this.password_selected = true;
        }
        if(!good) {
            this.loginWindowError = "Podaj dane logowania";
            return;
        }
        var self=this;
        
        this.$http.get('http://' + this.host+ ':' +this.port+ '/signin', {
            params: {
                'login': self.login, 
                'password': self.password
                }
        }).then(function(response){
            if(response.status == "200"){
                self.sessionToken = response.data[0]["ticket"];
                // console.log(self.sessionToken)
                self.serverError = false;
                if (parseInt(self.sessionToken, 10) > 0) {
                    // console.log('logged in')
                    self.signInAction = false;
                    self.isSessionActive = true;
                    self.createCookieSession('tokenIds', self.sessionToken);
                    self.createCookieSession('login', self.login);
                    self.consoleMessage = "Logowanie pomyślne";
                    setTimeout(self.hideConsole, 2000);
                    // resend request is response is displayed
                    // it prevent double fav adding TODO
                    // if (this.r_response) {
                    //     self.posts();
                    // }
                } else {
                    self.loginWindowError = "Niepoprawne dane";
                }
           }
        }).catch((e) => {
            console.log(e);
            self.serverErrorInfo = e;
            self.serverError = true;
            self.r_response = false;
            self.logResponse = false;
            self.discardLoginData();
         }
        )
    },
    signUp: function() {
        var good=true;
        if (!this.login) {
            // console.log("no login");
            good = false;
            this.login_selected = false;
            this.loginWindowError = "Wypełnij wszystkie pola";
        } else {
            this.login_selected = true;
            if (this.login.length < 5) {
                good = false;
                this.loginWindowError = "Login musi mieć o najmniej 5 znaków";
            } else if (!this.isCharAllowed(this.login)) {
                good = false;
                this.loginWindowError = "Dozwolone tylko litery i cyfry";
            }
        }
        if (!this.password) {
            // console.log("no password");
            good = false;
            this.loginWindowError = "Wypełnij wszystkie pola";
            this.password_selected = false;
        } else {
            this.password_selected = true;
            if (this.password.length < 5) {
                good = false;
                this.loginWindowError = "Hasło musi mieć o najmniej 5 znaków";
            } else if (!this.isCharAllowed(this.password)) {
                good = false;
                this.loginWindowError = "Dozwolone tylko litery i cyfry";
            }
        }    
        if(!good) {
            return;
        }
        var self = this;
        this.$http.get('http://' + this.host+ ':' +this.port+ '/signup', {
            params: {
                'login': self.login, 
                'password': self.password
                }
        }).then(function(response){
            if(response.status == "200"){
                self.sessionToken = response.data[0]["ticket"];
                // console.log(self.sessionToken)
                self.serverError = false;
                if (parseInt(self.sessionToken, 10) > 0) {
                    // server returns positive number when user is added
                    // -1 when the login exists in the DB
                    self.signUpAction = false;
                    self.isSessionActive = true;
                    self.createCookieSession('tokenIds', self.sessionToken);
                    self.createCookieSession('login', self.login);
                    self.consoleMessage = "Zarejestowano nowego użytkownika";
                    setTimeout(self.hideConsole, 2000);
              
                } else {
                    self.loginWindowError = "Podany login już istnieje, wybierz inny";
                }
           }
        }).catch((e) => {
            console.log(e);
            self.serverErrorInfo = e;
            self.serverError = true;
            self.r_response = false;
            self.logResponse = false;
            self.discardLoginData();
         }
        )
    },
    addToFavourites(id) {
        var self = this;
        this.$http.get('http://' + this.host+ ':' +this.port+ '/addfav', {
            params: {
                'tokenId': self.sessionToken, 
                'queueId': id
                }
        }).then(function(response){
            if(response.status == "200"){
                for (i=0; i<self.data.length; ++i) {
                    if (self.data[i].id == id) {
                        self.data[i].is_fav = true;
                    }
                }   
           }
        }).catch((e) => {
            return;
         }
        )
    },
    deleteFromFavourites(id) {
        var self = this;
        this.$http.get('http://' + this.host+ ':' +this.port+ '/removefav', {
            params: {
                'tokenId': self.sessionToken, 
                'queueId': id
                }
        }).then(function(response){
            if(response.status == "200"){
                for (i=0; i<self.data.length; ++i) {
                    if (self.data[i].id == id) {
                        self.data[i].is_fav = false;
                    }
                }   
           }
        }).catch((e) => {
            return;
         }
        )
    },
    discardLoginData() {
        // flush login-form data
        this.signUpAction = false;
        this.signInAction = false;
        this.login = "";
        this.password = "";
        this.loginWindowError = null;
    },
    displayFav() {
        var self = this;
        this.consoleMessage = "Czekaj...";
        this.serverError = false;
        this.clearBoard();
        this.$http.get('http://' + this.host+ ':' +this.port+ '/displayfav', {
            params: {
                'tokenId': self.sessionToken,
                }
        }).then(function(response){
            if(response.status == "200") {
                self.consoleMessage = null;
                self.data = response.data;
                self.r_response = true;
                self.isFavTable = true;
                self.serverError = false;
           }
        }).catch((e) => {
            self.serverError = true;
            self.consoleMessage = null;
            return;
         }
        )
    },
    signOut() {
        this.sessionToken = null;
        // disactive the session
        this.isSessionActive = false;
        // remove cookies
        this.removeCookiesSesstion();
        // remove forma data
        this.discardLoginData();
        this.consoleMessage = "Pomyślnie wylogowano";
        // clear received data
        this.clearBoard();
        setTimeout(this.hideConsole, 2000);
    },
    isCharAllowed(str) {
        // letters and numbers are allowed.
        // return false otherwise
        for (var i=0; i<str.length; ++i) {
            if (!str.charAt(i).match(/[a-zA-Z0-9]/i)) {
                return false;
            }
        }
        return true;
    },
    switchSingWindow: function() {
        if (this.signInAction) {
            this.discardLoginData();
            this.signUpAction = true;
        } else if (this.signUpAction) {
            this.discardLoginData();
            this.signInAction = true;
        }
    },
    createCookieSession: function(key, val) {
        var d = new Date();
        // cookie expires in 24 H
        let oneDayInMs = 24*60*60*1000;
        d.setTime(d.getTime() + (oneDayInMs));
        // convert to string in UTC format
        var expires = "expires="+ d.toUTCString();
        // console.log('session expiration: ' + expires);
        this.$cookies.set(key, val, d);
    },
    removeCookiesSesstion: function() {
        this.$cookies.remove('tokenIds');
        this.$cookies.remove('login');
    },
    hideConsole: function() {
        this.consoleMessage = null;
    },
    showHistory: function() {
        var self = this;
        this.consoleMessage = "Czekaj...";
        this.serverError = false;
        this.clearBoard();
        this.$http.get('http://' + this.host+ ':' +this.port+ '/showhistory', {
            params: {
                'tokenId': self.sessionToken,
                }
        }).then(function(response){
            if(response.status == "200") {
                self.consoleMessage = null;
                self.history = response.data;
                console.log(self.history);
                self.isFavTable = false;
                self.r_response = false;
                self.serverError = false;
           }
        }).catch((e) => {
            console.log(self.history);
            self.serverError = true;
            self.consoleMessage = null;
            return;
         }
        )
    },
    getProvince: function(x) {
        for (var i=0; i<this.regions.length; ++i) {
            if (this.regions[i].value === x) {
                return this.regions[i].text;
            }
        }
    },
    restoreHistory: function(row) {
        this.form_default.region = row.province;
        this.form_default.r_case = row.case;
        this.form_default.benefit = row.benefit;
        this.form_default.r_number = row.limit;
        this.form_default.r_location = row.location;
        this.clearBoard();
        this.sendRequest({
                r_region: this.form_default.region,
                r_case: this.form_default.r_case,
                r_benefit: this.form_default.benefit,
                r_number: this.form_default.r_number,
                r_location: this.form_default.r_location,
                r_token: this.sessionToken,
          }, '/get', true);
    },
    clearBoard: function() {
        this.r_response = null;
        this.data = null;
        this.isFavTable = false;
        this.history = null;
    }
  },
  created() {
      // debug display all cookies on page load
      // console.log(this.$cookies.get('tokenIds'))
      // console.log(this.$cookies.get('login'))
      if (this.$cookies.get('tokenIds') && this.$cookies.get('login')) {
          // user is already signed-in
          // bring back session variables
          this.isSessionActive = true;
          this.sessionToken = this.$cookies.get('tokenIds');
          this.login = this.$cookies.get('login');
      }
  }
})
