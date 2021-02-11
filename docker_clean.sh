#!/bin/bash
​docker rmi $(docker images -q -f dangling=true)
​docker volume rm $(docker volume ls -qf dangling=true)