#!/bin/bash

CIRCUIT=deposit
buildDir="build"

mkdir -p ${buildDir}

# Compile the circuit
circom ${CIRCUIT}.circom --wasm -o ${buildDir}