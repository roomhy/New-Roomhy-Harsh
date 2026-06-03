import os

directory = "e:/Roomhy-Website/Roohmy-Frontend/src/pages/superadmin"

for filename in os.listdir(directory):
    if filename.endswith(".jsx"):
        path = os.path.join(directory, filename)
        with open(path, "r") as f:
            content = f.read()
        
        if "{{" in content or "}}" in content:
            new_content = content.replace("{{", "{").replace("}}", "}")
            with open(path, "w") as f:
                f.write(new_content)
            print(f"Fixed {filename}")
