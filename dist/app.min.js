
(function () {
  $(document).ready(function () {
    let incidentsTable, dateRangeField;

    initTable();

    dateRangeField = flatpickr($('.flatpickr')[0], {
      "plugins": [new rangePlugin({ input: "#endDate" })]
    });

    $('#goBackBtn').on('click', function () {
      $('.selected-incident, #goBackBtn').hide();
      $('.incidents-table-container').show();
    });

    $('#startDate, #endDate').on('change keyup', function (event) {
      if (event.target.value) {
        $("#incidentKey").prop('disabled', true);
        // $("input").prop('disabled', false);
      } else {
        $("#incidentKey").prop('disabled', false);
      }
    });

    $('#incidentKey').on('change keyup', function (event) {
      if (event.target.value) {
        $('#startDate, #endDate').prop('disabled', true);
        // $("input").prop('disabled', false);
      } else {
        $('#startDate, #endDate').prop('disabled', false);
      }
    });

    $('.clear-button').on('click', function() {
      $('#startDate, #endDate, #incidentKey').val('').prop('disabled', false);
      location.reload();
    });

    $('.filter-button').on('click', function () {
      const incidentKey = $('#incidentKey').val();
      if (!dateRangeField.selectedDates && dateRangeField.selectedDates.length > 0 && !incidentKey) {
        return;
      }

     // let url = '/incidents.json';
     let url = 'http://10.194.74.118:8000/incidents/date_range/'
      let params;
      if (dateRangeField.selectedDates && dateRangeField.selectedDates.length > 0) {
        params = {
          startDate: dateRangeField.selectedDates[0],
          endDate: dateRangeField.selectedDates[1]
        }
       url += getDateParam(params.startDate) + '/' + getDateParam(params.endDate)  + '/';
      } else {
        url = 'http://10.194.74.118:8000/incidents/' + incidentKey  + '/';
  //url = '/incidentsByKey.json';
      }

      $('.service-error').hide();
      $.ajax({
        method: 'GET',
        url: url,
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        success: AjaxSucceeded,
        error: AjaxFailed
      }).done(function (result) {
        if (incidentKey) {
          setIncidentValidationDetails(result.incidents[0]);
        } else {
          incidentsTable.clear().draw();
          incidentsTable.rows.add(result.incidents).draw();
          $('.selected-incident').hide();
          $('.incidents-table-container, #goBackBtn').show();
        }
      }).fail(function (jqXHR, textStatus, errorThrown) {
        $('.service-error').show();
      });
    });
//error messages from server..
function AjaxFailed(result){
  $("#error-message").show();
}
function AjaxSucceeded(result){
  $("#error-message").hide();
}
    $('.dataTable').on('click', function () {
      var data = incidentsTable.row($(event.target).parents('tr')).data();
      setIncidentValidationDetails(data);
    });
  //Add errors to  Individual incident table 
  //displaying column, description and value.
  function setIncidentValidationDetails(data) {
    $('.errors-container').html('');
    var failed_validations = '';
    if (data.failed_validations && data.failed_validations.length) {
      data.failed_validations.forEach(validation => {
        let errors = '';
        if(validation.errors && validation.errors.length) {
          errors = '<div> <b>Column : </b> ' + validation.errors[0].column + '<br><b> Value : </b>' + validation.errors[0].value + '</div>';
        }
        
        failed_validations += '<div class="validation-error">' + '<b> Description : </b>' + validation.description + errors + '</div>';
      });
      $('.errors-container').html(failed_validations);
      $('.selected-incident').removeClass('no-validation-errors');
    } else {
      $('.selected-incident').addClass('no-validation-errors');
    }
    $('#selectedIncidentKey').text(data.incidentnumber);
    $('.selected-incident, #goBackBtn').show();
    $('.incidents-table-container').hide();
  }
    // function setIncidentValidationDetails(data) {
    //   $('.errors-container').html('');
    //   var errors = '';
    //   if (data.failed_validations && data.failed_validations.length) {
    //     data.failed_validations.forEach(validation => {
    //       errors =
    //        '<ul class="validation-error">' + 
    //        '<li>' 
    //       + "Type :"+ "&nbsp" + validation.error[0].column +
    //       '</li>' + 
    //       '<li style="color:red">' 
    //       +"Current Value :"+ "&nbsp" + error.value + 
    //       '</li>' +
    //        '<li>' 
    //       +"Description :"+ "&nbsp" + error.description + 
    //       '</li>' 
    //       +'</ul>';
    //       console.log("errors.value" + errors.value);
    //     });
    //     $('.errors-container').html(errors);
    //     $('.selected-incident').removeClass('no-validation-errors');
    //   } else {
    //     $('.selected-incident').addClass('no-validation-errors');
    //   }
    //   $('#selectedIncidentKey').text(data.incidentnumber);
    //   $('.selected-incident, #goBackBtn').show();
    //   $('.incidents-table-container').hide();
    // }

    function getDateParam(date) {
      let year = date.getUTCFullYear();
      let month = ('0' + (date.getMonth() + 1)).slice(-2);
      let dt = ('0' + date.getDate()).slice(-2);
      return `${year}${month}${dt}`
    }
  
    function initTable() {
      incidentsTable = $("#incidentsTable").DataTable({
        data: [],
        columns: [
          { data: "incidentnumber" },
          {
            data: "failed_validations",
            render: function (data, type, row) {
              let errors = '<ul>';
              data && data.forEach(error => {
                errors += '<li>' + error.description +'</li>' ;
                //+'<li>' + error.description +'</li>' + '<li>' + error.value +'</li>';
              });
              errors += '</ul>';
              return errors;
            }
          }
        ],
        rowCallback: function (row, data) { },
        filter: false,
        info: false,
        ordering: false,
        processing: true,
        retrieve: true,
        searching: true
      });
    }
  });
})();
