#!/bin/bash
    gulp build
    git add ./src/ ./bin/ ./package.json
    #git add ./bin/index.html ./bin/version.json ./src/version.json
    git commit -m "up version"

    git push origin master

    cd f:/Projects/fugaso

    yes | cp -rf ./${projects_list[i]}/bin/* ../client/fugaso-games-release/${projects_map[${projects_list[i]}]}
    yes | cp -rf ./${projects_list[i]}/bin/* ../client/fugaso-games-test-jackpot/${projects_map[${projects_list[i]}]}

exit 0
