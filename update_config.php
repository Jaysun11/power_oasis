<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = $_POST['data'];
    $output = '';
    $retval = '';
    exec("/usr/bin/python3 /var/www/html/power_oasis/update_config.py '$data' 2>&1", $output, $retval);
    if ($retval == 0) {
        echo "Python script ran successfully!";
    } else {
        echo "Python script returned error code $retval";
    }
    echo implode("\n", $output);
}
?>

