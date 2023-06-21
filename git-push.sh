#!/bin/bash

if [[ $(git remote get-url sshup) =~ ^ssh://git@git.protronic-gmbh.de.* ]];
then
  git config --global user.email "r.seidler@protronic-gmbh.de"
  git config --global user.name "Robert Seidler - Protronic GmbH"
else
  git config --global user.email "robert.seidler1@googlemail.com"
  git config --global user.name "Robert Seidler"
fi

# echo $(git config --global user.email)

git add *
git commit
git push sshup
