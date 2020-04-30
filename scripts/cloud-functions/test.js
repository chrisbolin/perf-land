const main = require("./function").main;

function Response() {
  this.result = {};

  this.constructor = () => this;

  this.status = (s) => {
    this.result.status = s;
    return this;
  };

  this.send = (payload) => {
    this.result.payload = payload;
    console.log(this.result);
    return this;
  };
}

const request = {
  query: { url: "https://www.google.com/" },
};

main(request, new Response());
