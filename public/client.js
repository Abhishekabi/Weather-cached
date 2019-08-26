var inputField = $("#search");
var submit = $("#weatherbutton");

submit.on("click", () => {
  var city = inputField.val();
  inputField.val("");
  fetchWeather(city.trim());
});

inputField.on("keypress", event => {
  var keycode = event.keyCode ? event.keyCode : event.which;
  if (keycode == "13") {
    var city = inputField.val();
    fetchWeather(city.trim());
    inputField.val("");
    return false;
  }
});

var setData = function({ city, temp, humid, desc }) {
  city = city.charAt(0).toUpperCase() + city.slice(1);
  $(".advance-search > .row").removeClass("dN");
  $("#cityholder")
    .text(`Weather in ${city}`)
    .css("color", "#999");
  $("#temp").text(`${temp} degree celcius`);
  $("#humid").text(`${humid} percent`);
  $("#desc").text(desc);
};

var setErrorMessage = function(message) {
  $(".advance-search > .row").addClass("dN");
  $(".advance-search > .desc")
    .text(`Oops! ${message}`)
    .css("color", "rgba(255, 82, 82, 1.0)");
};

var fetchWeather = function(city) {
  if (city.length > 0) {
    $.ajax(`/weather/${city}`, {
      dataType: "json",
      success: function(data, status, xhr) {
        if (data.message) setErrorMessage(data.message);
        else setData(data);
      },
      error: function(jqXhr, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    });
  }
};
