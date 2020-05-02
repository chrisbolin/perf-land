const main = require("./function").main;

function Response() {
  this.result = {};

  this.constructor = () => this;

  this.status = (s) => {
    this.result.status = s;
    return this;
  };

  this.header = (header, value) => {
    this.result["header: " + header] = value;
    return this;
  };

  this.send = (payload) => {
    this.result.payload = payload;
    console.log(this.result);
    return this;
  };

  this.json = (payload) => {
    this.result.payload = payload;
    console.log(this.result);
    return this;
  };
}

const request = {
  query: {
    // url: "https://www.google.com/,https://twitter.com/",
    search: "twitter",
  },
};

main(request, new Response()).then((connection) => connection.destroy());
