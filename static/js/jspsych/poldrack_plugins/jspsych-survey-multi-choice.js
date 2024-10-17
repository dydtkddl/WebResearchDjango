/**
 * jspsych-survey-multi-choice
 * a jspsych plugin for multiple choice survey questions
 *
 * Shane Martin
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['poldrack-survey-multi-choice'] = (function() {

  var plugin = {};
// plugin.trial: 각 실험의 개별적인 trial(실험단위)을 처리하는 함수입니다.
// trial: 실험에서 제공된 파라미터(질문, 옵션 등)를 포함한 객체입니다.
  plugin.trial = function(display_element, trial) {

    var plugin_id_name = "jspsych-survey-multi-choice";
    var plugin_id_selector = '#' + plugin_id_name;
    // _join: 전달된 문자열 배열을 -로 구분하여 하나의 문자열로 결합하는 보조 함수입니다.
    var _join = function( /*args*/ ) {
      var arr = Array.prototype.slice.call(arguments, _join.length);
      return arr.join(separator = '-');
    }

    // trial defaults
    // trial.preamble: 설문 시작 전에 표시될 안내문을 설정하며, 정의되지 않았을 경우 빈 문자열로 기본값을 설정합니다.
    // trial.required: 각 질문에 대해 필수 응답 여부를 설정하며, 기본값은 null입니다.
    // trial.horizontal: 응답 옵션을 수평으로 표시할지 여부를 결정하는 속성으로, 기본값은 false입니다.
    trial.preamble = typeof trial.preamble == 'undefined' ? "" : trial.preamble;
    trial.required = typeof trial.required == 'undefined' ? null : trial.required;
    trial.horizontal = typeof trial.horizontal == 'undefined' ? false : trial.horizontal;
    trial.exp_id = typeof trial.exp_id == 'undefined' ? "exp_id" : trial.exp_id;
    trial.pages
    trial.options
    trial.scale = typeof trial.scale == 'undefined' ? [] : trial.scale; // Ensure scale is initialized as array
    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    //jsPsych.pluginAPI.evaluateFunctionParameters: trial 내에 함수로 정의된 속성이 있으면 이를 평가하여 그 값을 반환합니다.
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);




    // form element

    // trial_form_id: 폼의 고유 ID를 생성합니다.
    // display_element.append: HTML 문서 내에 새로운 <form> 요소를 추가합니다.
    // $trial_form: jQuery를 사용해 생성한 폼을 선택합니다.
    var trial_form_id = _join(plugin_id_name, "form");
    display_element.append($('<form>', {
      "id": trial_form_id,
      "class" : "multi-choice-form"
    }));
    var $trial_form = $("#" + trial_form_id);

    // show preamble text
    // 설문지 상단에 설명을 표시하는 preamble 영역을 추가합니다.
    var preamble_id_name = _join(plugin_id_name, 'preamble');
    $trial_form.append($('<div>', {
      "id": preamble_id_name,
      "class": preamble_id_name
    }));
    $('#' + preamble_id_name).html(trial.preamble);


    // add multiple-choice questions
    // 질문 개수만큼 반복하여 각 질문을 생성합니다.
    // trial.horizontal 속성이 true이면 응답 옵션을 수평으로 배치합니다.
    for (var i = 0; i < trial.pages.length; i++) {
      // create question container
      var question_classes = [_join(plugin_id_name, 'question')];
      if (trial.horizontal) {
        question_classes.push(_join(plugin_id_name, 'horizontal'));
      }



      //각 질문에 대해 <div> 요소를 생성하고 해당 질문 텍스트를 추가합니다.
      $trial_form.append($('<div>', {
        "id": _join(plugin_id_name, i),
        "class": question_classes.join(' ')
      }));
      var question_selector = _join(plugin_id_selector, i);
      // add question text

      $(question_selector).append(
        '<p class="' + plugin_id_name + '-text survey-multi-choice">' + trial.pages[i][0] + '</p>'
      );



// create option radio buttons
// 각 질문에 대해 선택지를 추가합니다.
// 라디오 버튼을 생성하고 각 옵션에 대한 텍스트와 함께 <label> 요소로 감쌉니다.

// 먼저 question_selector 아래에 <ul>을 추가
$(question_selector).append($('<ul>', {
  "class": "radio-list"  // 라디오 버튼들을 담을 리스트의 클래스
}));

var $ul = $(question_selector).find('.radio-list');  // 방금 추가한 <ul>을 선택

for (var j = 0; j < trial.options[0][0].length; j++) {
  var option_id_name = _join(plugin_id_name, "option", i, j),
    option_id_selector = '#' + option_id_name;

  // 각 라디오 버튼과 라벨을 <li>로 추가
  var $li = $('<li>', {
    "id": option_id_name,
    "class": _join(plugin_id_name, 'option radio-container')  // 라디오 버튼 컨테이너
  });

  // create radio button
  var input_id_name = _join(plugin_id_name, 'response', i);
  var radio_button = '<input type="radio" name="' + input_id_name + '" value="' + trial.options[0][i][j] + '" class="custom-radio">';

  // add label and question text
  var option_label = '<label class="' + plugin_id_name + '-text jspsych-poldrack-survey-multi-choice-text radio-label">' + trial.options[0][i][j] + '</label>';

  // 라디오 버튼을 먼저 추가하고 그 아래에 라벨을 추가
  $li.append(radio_button + option_label);

  // <ul> 안에 <li> 추가
  $ul.append($li);
}




      //trial.required가 설정된 경우 해당 질문이 필수로 응답해야 함을 표시하는 * 기호를 추가합니다.
      //  또한 라디오 버튼을 필수 입력 필드로 설정합니다.
      if (trial.required && trial.required[i]) {
        // add "question required" asterisk
        $(question_selector + " p").css({
          "margin-top": "3px",
          "margin-bottom": "3px"
        });
        $(question_selector + " p").append(
          "<span class='required' >*</span>")

        // add required property
        $(question_selector + " input:radio").prop("required", true);
      }
    }

    // //  또한 라디오 버튼을 필수 입력 필드로 설정합니다.
    // if (trial.required && trial.required[i]) {
    //   // add "question required" asterisk with margin style
    //   $(question_selector + " p").append("<span class='required' style='margin-top: 10px; margin-bottom: 10px;'>*</span>");
    
    //   // add required property
    //   $(question_selector + " input:radio").prop("required", true);
    // }



    // add submit button
    // 설문 제출을 위한 Submit 버튼을 추가합니다.
    $trial_form.append($('<input>', {
      'type': 'submit',
      'id': plugin_id_name + '-next',
      'class': plugin_id_name + ' jspsych-btn',
      'value': '다음 >'
    }));







    // 폼 제출 시 이벤트 핸들러를 통해 사용자의 응답 데이터를 수집합니다.
    // 각 질문에 대한 사용자의 응답을 가져와 question_data 객체에 저장하고, 응답 시간(response_time)도 기록합니다.
    // 데이터를 저장한 후, 다음 트라이얼로 이동합니다.
    $trial_form.submit(function(event) {
      event.preventDefault();
      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;

      // create object to hold responses
      // var question_data = {};: 사용자의 응답 데이터를 저장할 빈 객체를 생성합니다.
      // $("div." + plugin_id_name + "-question").each: 각 질문(question)에 대해 반복문을 실행합니다. plugin_id_name은 이 플러그인에서 각 질문이 포함된 div 요소의 클래스 이름입니다.
      // var id = "Q" + index;: 질문에 고유한 ID를 부여합니다. 예를 들어, 첫 번째 질문의 ID는 "Q0"가 됩니다.
      // var val = $(this).find("input:radio:checked").val();: 현재 질문에서 사용자가 선택한 라디오 버튼의 값을 가져옵니다. 사용자가 선택하지 않았을 경우 val은 undefined입니다.
      // var obje = {}; obje[id] = val;: 새로운 객체를 생성하고, id를 키로, 사용자가 선택한 값을 그 키의 값으로 설정합니다.
      // $.extend(question_data, obje);: question_data 객체에 현재 질문에 대한 데이터를 추가합니다. question_data는 모든 질문의 응답을 저장하는 객체입니
      var trial_data = {};
      $("div." + plugin_id_name + "-question").each(function(index) {
        var id = "Q" + index;
        var val = $(this).find("input:radio:checked").val();
        // Get the numeric code from the scale
        var idx = trial.options[0][0].indexOf(val)
        var numeric_code =Object.values(trial.scale[0][0])[idx];
        var response_range =  Object.values(trial.scale[0][0]).length; // Get the total number of response options
        $.extend(trial_data , {"score_response" : numeric_code, "stim_response" : val, "response_range" : response_range})
      });

      // Save the collected trial data, spreading each field directly
      $.extend(trial_data, {
        "rt": response_time,  // Total time spent on this page
        "qnum" : 1,
        "page_num" : 1,
        "trial_num" :jsPsych.currentTimelineNodeID(),
        "stim_question" : trial.pages,
        "times_viewed" : 1,
        "view_history" : {
        start_time: startTime,  // Start time of the trial
        end_time: (new Date()).getTime(),  // End time of the trial
        duration: response_time  // Duration in ms
                  },
        
        "exp_id": trial.exp_id  // Experiment ID
      });
      // 설문이 완료되면 폼과 그 안에 있던 질문 및 옵션을 포함한 HTML 내용을 지웁니다. 이 작업을 통해 다음 트라이얼이 표시될 준비를 합니다.
      display_element.html('');
      // next trial
      // jsPsych.finishTrial: 현재 트라이얼을 종료하고, trial_data 객체를 jsPsych에 전달합니다. 
      // 이 함수가 호출되면 다음 트라이얼이 시작되거나, 실험이 끝났다면 결과를 보여줍니다.
      jsPsych.finishTrial(trial_data);
    });




    // 실험 시작 시간을 기록합니다.
    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
