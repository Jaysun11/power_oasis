    //Update Config File
    function sendDatatoConfig(newValue) {

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log(this.responseText);
            }
        };
        xmlhttp.open("POST", "/update_config.php", true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        var data = {'generator_SOC_Start': newValue};
        xmlhttp.send("data=" + JSON.stringify(data));
  
      }
  