#!/bin/bash
# no verbose


# Since nextjs writes env variables to the code during build, we need to
# find a way to pass them to the app through the command / container line via dynamic
# variables. This script overwites the default env variables with the ones
# passed to the container.
# https://frontend-digest.com/environment-variables-in-next-js-9a272f0bf655

set +x
# config
envFilename='.env.production'
nextFolder='./.next/'
function apply_path {
  # read all config file
  while read line; do
    # no comment or not empty
    if [ "${line:0:1}" == "#" ] || [ "${line}" == "" ]; then
      continue
    fi

    # split
    configName="$(cut -d'=' -f1 <<<"$line")"
    configValue="$(cut -d'=' -f2 <<<"$line")"
    # get system env
    envValue=$(env | grep "^$configName=" | grep -oe '[^=]*$');

    # if config found
    if [ -n "$configValue" ] && [ -n "$envValue" ]; then
      # replace all
      echo "Replace: ${configValue} with: ${envValue}"
      find $nextFolder \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#$configValue#$envValue#g"
    fi
  done < $envFilename
}
apply_path
echo "Starting Nextjs"
exec "$@"
