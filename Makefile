SRC_PATH="./src"
DIST_PATH="./dist"

all: clean build
	
build:
	cp $(SRC_PATH)/* $(DIST_PATH)

clean:
	rm -f $(DIST_PATH)/*