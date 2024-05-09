const coinImage = document.querySelector(".single-crypto-details .left");
const coinDetails = document.querySelector(".single-crypto-details .right");
const cryptoChart = document.querySelector("#cryptoChart");

let t1 = gsap.timeline()
t1.from(".single-crypto-details .left",{
  x:-100,
  opacity:0,
  stagger:0.5,
  duration:1
},"same")
t1.from(".single-crypto-details .right",{
  x:100,
  opacity:0,
  stagger:0.5,
  duration:1
},"same")

t1.from("#cryptoChart",{
  y:-300,
  opacity:0,
  duration:1
})

// console.log(window.location.href);
const currentURL = new URL(window.location.href);
// console.log(currentURL);
const params = new URLSearchParams(currentURL.search);

// console.log(params);

if (!params.has("id")) {
  window.location.href = "search.html";
} else {
  getDataFromAPI(
    `https://api.coingecko.com/api/v3/coins/${params.get(
      "id"
    )}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
  ).then((response) => {
    console.log(response);
    showDetails(response);
  });

  // GET CHART DATA
  getDataFromAPI(
    `https://api.coingecko.com/api/v3/coins/${params.get(
      "id"
    )}/market_chart?vs_currency=inr&days=7`
  ).then((response) => {
    console.log(response);
    showChart(response.prices);
  });
}

function showDetails(obj) {
  const img = document.createElement("img");
  img.src = obj.image.large;
  coinImage.append(img);

  const name = document.createElement("h3");
  name.innerText = obj.name + " ( " + obj.symbol + " ) ";

  const desc = document.createElement("p");
  desc.innerHTML = obj.description.en;

  coinDetails.append(name, desc);
}

function showChart(data) {
  const timesstamps = [];
  const priceInINR = [];

  data.forEach((dt) => {
    const date_obj = new Date(dt[0]);
    // console.log(date_obj);


    let hours = date_obj.getHours();
    if (hours < 10) {
      hours = "0" + hours;
    }
    let minutes = date_obj.getMinutes();
    if (minutes < 10) {
      minutes = "0" + minutes;
    }

    timesstamps.push(`${hours}:${minutes}`);
    priceInINR.push(dt[1]);
  });
  // console.log(timesstamps, priceInINR)

  const colorArr = [];
  for (let i = 1; i < priceInINR.length; i++) {
    const priceDifference = priceInINR[i] - priceInINR[i - 1];
    const color = priceDifference >= 0 ? "blue" : "red";
    // const prev = priceInINR[i-1];
    // const curr = priceInINR[i];
    // const color = curr > prev ? "blue" : "red";
    colorArr.push(color);
  }

  const ctx = document.getElementById("cryptoChart").getContext("2d");
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: timesstamps,
      datasets: [
        {
          label: "Price (in INR)",
          data: priceInINR,
          borderColor: "rgb(170, 159, 3)",
          tension: 0.4,
          backgroundColor: colorArr,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

async function getDataFromAPI(url) {
  const response = await fetch(url);
  const result = await response.json();
  return result;
}