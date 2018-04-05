#!/usr/bin/env bats

load harness

setup() {
	pushd $BATS_TEST_DIRNAME/$BATS_TEST_NAME
}

teardown() {
	[ -d ./dist ] && rm -r ./dist
	popd
}

@test "it loads" {
	faucet
}

@test "it transforms the source" {
	faucet
	assert_identical dist/hello.txt uryyb.txt
}

@test "it respects compact" {
	faucet --compact
	assert_identical dist/hello.txt hello.txt
}

@test "it processes options" {
	faucet
	assert_identical dist/hello.txt hello.txt
}
