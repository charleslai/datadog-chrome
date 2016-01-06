$(document).ready(function() {
  // ==========================
  //    Bootstrapping Logic
  // ==========================
  // Initially hide alerts, admin, and ssl refresh stuff
  hideAlerts();
  hideAdmin();
  $("#refresh-ssl").hide();
  $("#links").hide();
  // On page load - add all iFrames from the extension.
  chrome.storage.sync.get(null, function(items) {
    if (Object.keys(items).length) {
      for (var key in items) {
        console.log(key);
        $("#embeds").append('<div class="box col-xs-12 col-sm-12 col-md-12 col-lg-12">' + items[key] + '</div>');
      }
    }
    else {
      $("#embeds").append("<em>No embeds stored!</em>");
    }
  });
  // Load embed keys from local storage into delete page
  chrome.storage.sync.get(null, function(items) {
      if (Object.keys(items).length) {
        for (var key in items) {
          $("#delete-embed-checkbox").append('<div class="checkbox"><label><input class="delete-checkbox" type="checkbox" value="' + key + '">' + escapeHTML(items[key]) + '</label></div>');
          $("#enable-embed-checkbox").append('<div class="checkbox"><label><input class="enable-checkbox" type="checkbox" value="' + getToken(items[key]) + '">' + escapeHTML(items[key]) + '</label></div>');
          $("#revoke-embed-checkbox").append('<div class="checkbox"><label><input class="revoke-checkbox" type="checkbox" value="' + getToken(items[key]) + '">' + escapeHTML(items[key]) + '</label></div>');
        }
      }
      else {
        $("#delete-embed-checkbox").append("<em>No embeds stored!</em>");
        $("#enable-embed-checkbox").append("<em>No embeds stored!</em>");
        $("#revoke-embed-checkbox").append("<em>No embeds stored!</em>");
      }
  });
  
  // ==========================
  //         NAVIGATION 
  // ==========================
  // MAIN EMBED TABS
  $("#embeds-btn").click(function(event) {
    // Show embeds and hide everything else
    $("#embeds").show();
    hideAdmin();
    hideAlerts();
    $("#refresh-ssl").hide();
    $("#links").hide();
  });
  $("#logo").click(function(event) {
    // Reload to get new embeds
    location.reload();
  });

  // INDIVIDUAL ADMIN OPTIONS
  $("#add-embed-nav").click(function(event) {
    // Show the admin container, hide all options and embeds, and show add-embed option
    hideAlerts();
    $("#admin").show();
    $(".admin-option").hide();
    $("#embeds").hide();
    $("#refresh-ssl").hide();
    $("#links").hide();
    $("#add-embed").show();
  });
  $("#get-embed-nav").click(function(event) {
    // Show the admin container, hide all options and embeds, and show get-embed option
    hideAlerts();
    $("#admin").show();
    $(".admin-option").hide();
    $("#embeds").hide();
    $("#refresh-ssl").hide();
    $("#links").hide();
    $("#get-embed").show();
  });
  $("#create-embed-nav").click(function(event) {
    // Show the admin container, hide all options and embeds, and show create-embed option
    hideAlerts();
    $("#admin").show();
    $(".admin-option").hide();
    $("#embeds").hide();
    $("#refresh-ssl").hide();
    $("#links").hide();
    $("#create-embed").show();
  });
  $("#delete-embed-nav").click(function(event) {
    // Show the admin container, hide all options and embeds, and show delete-embed option
    hideAlerts();
    $("#admin").show();
    $(".admin-option").hide();
    $("#embeds").hide();
    $("#refresh-ssl").hide();
    $("#delete-embed").show();
  });
  $("#enable-embed-nav").click(function(event) {
    // Show the admin container, hide all options and embeds, and show delete-embed option
    hideAlerts();
    $("#admin").show();
    $(".admin-option").hide();
    $("#embeds").hide();
    $("#refresh-ssl").hide();
    $("#enable-embed").show();
  });
  $("#revoke-embed-nav").click(function(event) {
    // Show the admin container, hide all options and embeds, and show delete-embed option
    hideAlerts();
    $("#admin").show();
    $(".admin-option").hide();
    $("#embeds").hide();
    $("#refresh-ssl").hide();
    $("#revoke-embed").show();
  });

  // ==========================
  //  SSL Refresh Instructions
  // ==========================
  // Open api in webview and get user to proceed
  $("#refresh-ssl-btn").click(function(event) {
    hideAlerts();
    hideAdmin();
    $("#embeds").hide();
    $("#links").hide();
    $("#refresh-ssl").show();
  });
  $("#api-link").click(function(event) {
    chrome.tabs.update({url: "https://datadoghq.com/api/v1/graph/embed"});
    window.close();
  });

  // ==========================
  //  Admin: Add Embed (iframe)
  // ==========================
  // Add new embeds when the form is submitted
  $("#add-embed-btn").click(function(event) {
    event.preventDefault();
    hideAlerts();
    saveEmbed();
  });

  // ==========================
  //  Admin: Get Embed (token)
  // ==========================
  // Add new embeds when the form is submitted
  $("#get-embed-btn").click(function(event) {
    event.preventDefault();
    hideAlerts();
    getEmbed();
  });

  // ==========================
  //  Admin: Create Embed
  // ==========================
  // Create a new embed when the form is submitted
  $("#create-embed-btn").click(function(event) {
    event.preventDefault();
    hideAlerts();
    // Get form variables
    var graph_json = $.trim($("#create-embed-graph-json").val());
    if (graph_json === "") {
      $('#embed-add-failure').show();
      return;
    }
    var timeframe = $("#create-embed-timeframe").val();
    var size = $("#create-embed-size").val();
    var legend = $("#create-embed-legend").val();
    var api_key = auth["api_key"];
    var app_key = auth["app_key"];
    var api_url = base_url + '/api/v1/graph/embed?' + 'api_key=' + api_key + '&application_key=' + app_key;
    // Create AJAX call
    console.log(api_url);
    $.ajax({
      url: api_url,
      type: 'POST',
      dataType: 'json',
      data: {
        graph_json: graph_json,
        timeframe: timeframe,
        size: size,
        legend: legend
      },
    })
    .done(function(result) {
      console.log(result['html']);
      $("#add-embed-textarea").val(result['html']);
      saveEmbed();
    })
    .fail(function(error) {
      $('#request-failure').fadeIn('fast');
      console.log(error);
    })
    .always(function() {
      console.log("Create embed function call complete.");
    });
  });

  // ==========================
  //  Admin: Enable Embeds
  // ==========================
  // Enable All Embeds
  $("#enable-all-btn").click(function(event) {
    event.preventDefault();
    // Iteratively enable all embeds
    $.each($(".enable-checkbox"), function(index, el) {
      token = el.value;
      enableEmbed(token);
    });
    $('#embed-enable-success').fadeIn('fast');
  });

  // Enable specific embeds
  $("#enable-embed-btn").click(function(event) {
    event.preventDefault();
    var enabled = false;
    // Iteratively enable all checked embeds
    $.each($(".enable-checkbox"), function(index, el) {
      if (el.checked) {
        token = el.value;
        enableEmbed(token);
        enabled = true;
      }
    });
    if (!enabled) {
      hideAlerts();
      $('#embed-check-failure').fadeIn('fast');
    }
    else {
      hideAlerts();
      $('#embed-enable-success').fadeIn('fast');
    }
  });

  // ==========================
  //  Admin: Revoke Embeds
  // ==========================
  // Revoke All Embeds
  $("#revoke-all-btn").click(function(event) {
    event.preventDefault();
    // Iteratively revoke all embeds
    $.each($(".revoke-checkbox"), function(index, el) {
      token = el.value;
      revokeEmbed(token);
    });
    $('#embed-revoke-success').fadeIn('fast');
  });

  // Revoke specific embeds
  $("#revoke-embed-btn").click(function(event) {
    event.preventDefault();
    var revoked = false;
    // Iteratively revoke all checked embeds
    $.each($(".revoke-checkbox"), function(index, el) {
      if (el.checked) {
        token = el.value;
        revokeEmbed(token);
        revoked = true;
      }
    });
    if (!revoked) {
      hideAlerts();
      $('#embed-check-failure').fadeIn('fast');
    }
    else {
      hideAlerts();
      $('#embed-revoke-success').fadeIn('fast');
    }
  });

  // ==========================
  //  Admin: Delete Embeds
  // ==========================
  // Clear embeds when the clean button is clicked
  $("#clear-all-btn").click(function(event) {
    event.preventDefault();
    chrome.storage.sync.clear();
    hideAlerts();
    $(".delete-checkbox").hide('fast');
    $(".delete-checkbox").parent().hide('fast');
    $('#embed-clear-success').fadeIn('fast');
  });

  // Delete specific embeds
  $("#delete-embed-btn").click(function(event) {
    event.preventDefault();
    var deleted = false;
    // Iteratively delete all checked embeds and hide front end
    $.each($(".delete-checkbox"), function(index, el) {
      if (el.checked) {
        $(el).hide('fast');
        $(el).parent().hide('fast');
        chrome.storage.sync.remove(el.value);
        deleted = true;
      }
    });
    if (!deleted) {
      hideAlerts();
      $('#embed-check-failure').fadeIn('fast');
    }
    else {
      hideAlerts();
      $('#embed-delete-success').fadeIn('fast');
    }
  });

  // ==========================
  //      Helper Functions
  // ==========================
  // saveEmbed: function that saves an embed iFrame given in form
  function saveEmbed() {
    // Get a value saved in a form.
    var embed_code = $.trim($("#add-embed-textarea").val());
    // Check that there's some code there.
    if (!embed_code) {
      console.log('Error: No value specified');
      hideAlerts();
      $('#embed-add-failure').fadeIn('fast');
      return;
    }
    // Hash embed_code to get a unique key
    var embed_key = md5(embed_code);
    var save_object = {};
    save_object[embed_key] = embed_code;
    // Save the mapping using the Chrome storage API.
    chrome.storage.sync.set(save_object, function() {
      hideAlerts();
      $('#embed-add-success').fadeIn('fast');
    });
  }

  // getEmbed: function that saves an embed to the embed dash via token
  function getEmbed() {
    // Get a value saved in a form.
    var embed_id = $.trim($("#get-embed-input").val());
    // Check that there's some code there.
    if (!embed_id) {
      console.log('Error: No value specified');
      hideAlerts();
      $('#embed-add-failure').fadeIn('fast');
      return;
    }
    var api_key = auth["api_key"];
    var app_key = auth["app_key"];
    var api_url = base_url + '/api/v1/graph/embed/' + embed_id + '?' + 'api_key=' + api_key + '&application_key=' + app_key;
    // Create AJAX call
    console.log(api_url);
    $.ajax({
      url: api_url,
      type: 'GET',
      dataType: 'json'
    })
    .done(function(result) {
      console.log(result['html']);
      // Add iframe to textarea and save it
      $("#add-embed-textarea").val(result['html']);
      saveEmbed();
    })
    .fail(function(error) {
      $('#request-failure').fadeIn('fast');
      console.log(error);
    })
    .always(function() {
      console.log("Get embed function call complete.");
    });
  }

  // Enable and embed by token
  function enableEmbed(token) {
    // Get configutation and form api url
    var api_key = auth["api_key"];
    var app_key = auth["app_key"];
    var api_url = base_url + '/api/v1/graph/embed/' + token + '/enable?' + 'api_key=' + api_key + '&application_key=' + app_key;
    // Create AJAX call
    console.log(api_url);
    $.ajax({
      url: api_url,
      type: 'GET',
      dataType: 'json',
    })
    .done(function(result) {
      console.log(result);
    })
    .fail(function(error) {
      $('#request-failure').fadeIn('fast');
      console.log(error);
    })
    .always(function() {
      console.log("Enable embed function call complete.");
    });
  }

  // revokeEmbed: Revoke an embed by token
  function revokeEmbed(token) {
    // Get configutation and form api url
    var api_key = auth["api_key"];
    var app_key = auth["app_key"];
    var api_url = base_url + '/api/v1/graph/embed/' + token + '/revoke?' + 'api_key=' + api_key + '&application_key=' + app_key;
    // Create AJAX call
    console.log(api_url);
    $.ajax({
      url: api_url,
      type: 'GET',
      dataType: 'json',
    })
    .done(function(result) {
      console.log(result);
    })
    .fail(function(error) {
      $('#request-failure').fadeIn('fast');
      console.log(error);
    })
    .always(function() {
      console.log("Revoke embed function call complete.");
    });
  }

  // hideAlerts: function that hides all alerts in the plugin
  function hideAlerts() {
    $(".alert").hide();
  }

  // hideAdmin: function that hides admin dash and all options
  function hideAdmin() {
    $("#admin").hide();
    $(".admin-option").hide();
  }

  // getToken: use a regex to get token from iframe
  function getToken(iframe) {
    return iframe.match(/[a-zA-Z0-9]{64}/)[0];
  }

  // Escape HTML code
  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHTML(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }
});