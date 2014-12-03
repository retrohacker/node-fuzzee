#!/bin/bash
red='\033[0;31m'
NC='\033[0m'
FILES=(junit_functions.fcl junit_gauss.fcl junit_gbell.fcl junit_piecewise_linear.fcl junit_sigmoid.fcl junit_singletons.fcl junit_tipper.fcl junit_trape.fcl junit_triang.fcl tipper.fcl)
for f in ${FILES[*]}; do
  echo -e "${red}Processing $f file...${NC}"
  cat "tests/validation/${f}" | node test-cli 
  echo $'\n\n'
done
