from eralchemy import render_er
import environment

# Make sure graphviz is installed
#
# brew install graphviz

render_er(environment.get("DATABASE_URL"), "erd.png")
