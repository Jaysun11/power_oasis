import sys
import json

config_file_path = '/var/www/html/power_oasis/config.txt'

def update_config_file(data):
    
    data_dict = json.loads(data)
    sys.stdout.write(str(data_dict))
    variable_name = list(data_dict.keys())[0]
    new_value = data_dict[variable_name]
    sys.stdout.write(" Updating Variable: " + variable_name)
    sys.stdout.write(" To value: " + str(new_value))

    with open(config_file_path, 'r') as file:
        config_lines = file.readlines()

    for i in range(len(config_lines)):
        if config_lines[i].startswith(variable_name):
            config_lines[i] = f"{variable_name} = {new_value}\n"
            break

    with open(config_file_path, 'w') as file:
        file.writelines(config_lines)
        

if __name__ == "__main__":
    update_config_file(sys.argv[1])