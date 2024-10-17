/* jspsych-text.js
 * Josh de Leeuw
 *
 * This plugin displays text (including HTML formatted strings) during the experiment.
 * Use it to show instructions, provide performance feedback, etc...
 *
 * documentation: docs.jspsych.org
 *
 * Modified by Ian Eisenberg to allow timing response to be set
 */

jsPsych.plugins["poldrack-text"] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    trial.timing_response = trial.timing_response || -1;
    trial.cont_key = trial.cont_key || [];
    trial.timing_post_trial = (typeof trial.timing_post_trial === 'undefined') ? 1000 : trial.timing_post_trial;
    trial.iscsv= (trial.iscsv == "undefine") ? 0 :trial.iscsv
    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // set the HTML of the display target to replaced_text.
    display_element.html(trial.text);


    var after_response = function(info) {
      clearTimeout(t1);
      display_element.html(''); // clear the display

      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      var block_duration = trial.timing_response
      if (info.rt != -1) {
          block_duration = info.rt
      }

      var trialdata = {
        // "text": trial.text,
        "score_response" : "",
        "rt": info.rt,
        "response_range" : "",
        "key_press": info.key,
      }
       // Save the trial data
       jsPsych.data.write(trialdata);

      // 데이터를 가져오는 부분을 수정
      if (trial.iscsv === 1) {
        var all_data = jsPsych.data.getData();  // 수정된 데이터 가져오기 메서드
        var csv = convertToCSV(all_data);
        downloadCSV(csv, 'experiment_data.csv');
}

      jsPsych.finishTrial(trialdata);

    };

    var mouse_listener = function(e) {
      clearTimeout(t1);
      var rt = (new Date()).getTime() - start_time;

      display_element.unbind('click', mouse_listener);

      after_response({
        key: 'mouse',
        rt: rt
      });

    };

    // check if key is 'mouse' 
    if (trial.cont_key == 'mouse') {
      display_element.click(mouse_listener);
      var start_time = (new Date()).getTime();
    } else {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.cont_key,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }

    // end trial if time limit is set
    if (trial.timing_response > 0) {
      var t1 = setTimeout(function() {
        after_response({
          key: -1,
          rt: -1
        });
      }, trial.timing_response);
    }

  };
// Function to convert data to CSV format, removing rows without score_response
function convertToCSV(data) {
  // Filter out rows where score_response is null, undefined, or empty
  const filteredData = data.filter(row => row['score_response'] !== null && row['score_response'] !== undefined && row['score_response'] !== '');

  // Get headers from the first object of the filtered data
  const headers = Object.keys(filteredData[0]);

  // Map each row, extracting values based on the headers
  const rows = filteredData.map(row => headers.map(header => row[header]));

  // Combine headers and rows into CSV format
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  return csvContent;
}


  // Function to trigger CSV download
  function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  return plugin;
})();
