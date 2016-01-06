/*// Create handler that waits for checks for notifications via Datadog API
chrome.alarms.onAlarm.addListener(function() {
  // TODO: API Call to check for notifications/alerts
  var api_key = auth["api_key"];
  var app_key = auth["app_key"];
  var api_url = base_url + '/api/v1/events?' + 'api_key=' + api_key + '&application_key=' + app_key;
  var start = new Date().getTime() / 1000;
  var end = start - 300;
  var tags = "monitor";
  $.ajax({
    url: api_url,
    type: 'GET',
    dataType: 'json',
    data: {
      start: start,
      end: end,
      tags: tags
    },
  })
  .done(function(result) {
    // Create Notification Options
    console.log(result);
    var opt = {
      type: "basic",
      title: "Primary Title",
      message: "Primary message to display",
      iconUrl: "../img/icon128.png"
    };
    // API Call to create a notification
    chrome.notifications.create("", opt, function(Id){
      // Callback to clear notification
      setTimeout(chrome.notifications.clear, 10000, Id, function(cleared){});
    });
  })
  .fail(function(error) {
    console.log("Unexpected error in contacting the server to create alert notification.");
  })
  .always(function() {
    console.log("Notification function call complete.");
  });
});


// Create alarm event that fires every 5 minutes
chrome.alarms.create("datadog-notifications", {
  delayInMinutes: 5,
  periodInMinutes: 5
});*/
