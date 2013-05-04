$('#save').click(function() {
    if ($('#employee_name').val() == '' || $('#employee_salary').val() == '') {
      return alert('Please enter both name/salary!');
    }
    var data = {
      name: $('#employee_name').val(),
      salary: $('#employee_salary').val()
    };
    socket.emit('add employee', data);
    $('#employee_name').val('');
    $('#employee_salary').val('');
  });
