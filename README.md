Hello, this is the repository for my personal web site.


# deployment

The master branch is served.

To update :

- push commit to dev
- switch to master
- apply dev modification `git checkout dev -- .`
- keep the .gitignore `git checkout master -- .gitignore`
- build `grunt fullBuild`  ( need image magic to process the images )
- test `grunt serve` go to localhost:8081
- commit and push
