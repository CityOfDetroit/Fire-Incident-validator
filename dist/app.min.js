
(function() {
  $(document).ready(function () {
      let incidentsTable, dateRangeField;

      initTable();

      dateRangeField = flatpickr($('.flatpickr')[0], {
        "plugins": [new rangePlugin({ input: "#secondRangeInput" })]
      });

      $('.filter-button').on('click', function () {
        const incidentKey = $('#incidentKey').val();
        if(!dateRangeField.selectedDates && dateRangeField.selectedDates.length > 0 && !incidentKey) {
          return;
        }

        //let url = '/incidents.json';
      let url = 'http://10.194.74.118:8000/incidents/date_range/'
        let params;
        if(dateRangeField.selectedDates && dateRangeField.selectedDates.length > 0) {
          params = {
            startDate: dateRangeField.selectedDates[0],
            endDate: dateRangeField.selectedDates[1]
          }
       url += getDateParam(params.startDate) + '/'  + getDateParam(params.endDate);
        } else {
          url = 'http://10.194.74.118:8000/incidents/' + incidentKey;
           // url = '/incidentsByKey.json';
        }
        $.ajax({
          method: 'GET',
          url: url,
          dataType: 'json',
          contentType: 'application/json',
          processData: false
        }).done(function (result) {
          incidentsTable.clear().draw();
          incidentsTable.rows.add(result.incidents).draw();

        }).fail(function (jqXHR, textStatus, errorThrown) {
          // needs to implement if it fails
        });
      });

      $('.dataTable').on('click', function() {
          var data = incidentsTable.row( $(event.target).parents('tr') ).data();
          $('.errors-container').html('');
          var errors = '';
          data.failed_validations && data.failed_validations.forEach(error => {
              errors += '<div class="validation-error">' + error.rule + '</div>';
          });
          $('.errors-container').html(errors);
          $('#selectedIncidentKey').text(data.incidentnumber);
          $('.selected-incident').show();
          $('.incidents-table-container').hide();
      });

      function getDateParam(date) {
        let year = date.getUTCFullYear();
        let month = ('0' + date.getUTCMonth()).slice(-2);
        let dt = ('0' + date.getUTCDate()).slice(-2);
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
                          errors += '<li>' + error.rule + '</li>';
                      });
                      errors += '</ul>';
                      return errors;
              }}
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
})()