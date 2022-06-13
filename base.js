let currentData;
$.ajax({
  url: "https://api.jsonbin.io/b/62a4ed5605f31f68b3bdb39b/latest",
  success: function( data ) {
    currentData = data;
  },
  async: false
});

let NFTs = ['img1','img2','img3','img4','img5','img6','img7','img8','img9','img10'],
claimed = Object.keys(currentData),
owners = Object.values(currentData).flat(),
unclaimed = NFTs.filter(n => !claimed.includes(n));

$(".loading").removeClass("active");
var IP = getIp();
if (owners.includes(IP)) {
  let imgIndex;
  Object.values(currentData).forEach((value, index) => {
    if (value.length == 2 && value[1] == IP) {
      imgIndex = index;
    }
  });
  $(".main-nft").css("background-image","url('img/nft/"+imgIndex+".png')");
  $(".claimed").addClass("active");
} else if (unclaimed.length > 0) {
  updateGet();
  $(".get").addClass("active");
} else {
  $(".nomore").addClass("active");
}

var nth;
function updateGet() {
  nth = 11-unclaimed.length;
  $(".get .num").text(nth +".");
  $(".main-nft").css("background-image","url('img/nft/"+nth+".png')");
};

function validateForm() {
  let x = $(".form input").val();
  if (!validateInputAddress(x)) {
    alert("Valódi Ethereum címet adj meg!");
    return false;
  } else if (owners.includes(x)) {
    alert("Már kaptál egy NFT-t!");
  } else {
    updateDB(x, nth);
  }
}

// helper functions

function getIp() {
  let ipAddr; 
  $.ajax({
    url: "https://www.cloudflare.com/cdn-cgi/trace",
    success: function(data) {
      data = data.trim().split('\n').reduce(function(obj, pair) {
        pair = pair.split('=');
        return obj[pair[0]] = pair[1], obj;
      }, {});
      ipAddr = data.ip; },
    async: false
  });
  return ipAddr;
}

function updateDB(address, nth) {
  // adding current entry to db
  currentData["img"+nth] = [address,getIp()];
  // updating db
  let req = new XMLHttpRequest();
  req.onreadystatechange = () => {
    if (req.readyState == XMLHttpRequest.DONE) {
      window.location.reload();
    }
  };
  req.open("PUT", "https://api.jsonbin.io/b/62a4ed5605f31f68b3bdb39b", true);
  req.setRequestHeader("Content-Type", "application/json");
  req.send(JSON.stringify(currentData));
}

function validateInputAddress(address) {
  return (/^(0x){1}[0-9a-fA-F]{40}$/i.test(address));
}